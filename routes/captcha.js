const express = require('express');
const path = require("path");
const { promises: fsPromises } = require('fs');
const fs = require("fs");
const uuid = require('uuid');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const ColorKit = require("../models/ColorKit.js");
const generateUniqueName = require("../services/generateUniqueName.js")
const deleteFile = require("../services/deleteFiles.js");
const { pool, initializePool } = require('../controllers/initializeController.js');
const store = require('../models/store.js');
const generateJWTToken = require("../services/generateJWTToken.js");
const xss = require('xss');
const sanitize = require('mongo-sanitize');

const defaultColorKit = {
    buttonColorValue: "#007BFF",
    buttonColorHoverValue: "#0056b3",
    selectedCubeColorValue: "#ffff00",
    canvasOnHoverColorValue: "#ff0000",
    defaultTitle: "Please draw the object currently being displayed.",
}
const ApiKeyModel = require("../models/ApiKey.js");
const Company = require('../models/Company.js');

router.post('/reload', (req, res) => {
    const session = sanitize(req.body.session);
    if (session && session.uniqueFileName) {
        req.session.uniqueFileName = xss(session.uniqueFileName);
        deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`);
    }
});

router.post("/captchaSettings", async (req, res) => {
    try {
        const apiKey = xss(sanitize(req.body.apiKey));
        const apiKeyDB = await ApiKeyModel.findOne({ apiKey });
        const companyId = apiKeyDB.companies[0];
        let returnedColorKit;
        let message;
        let colorKit = await ColorKit.findOne({ company: companyId });
        if (colorKit) {
            message = "ColorKit found";
            returnedColorKit = colorKit;
        } else {
            message = "No ColorKit found returned the default color Kit";
            returnedColorKit = defaultColorKit;
        }

        res.status(200).json({ returnedColorKit, message });

    } catch (err) {
        console.error("Error while processing request:", err);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

router.post('/assets', async (req, res) => {
    let globalPool = await initializePool();
    try {
        let captchaIdentifier = uuid.v4();
        let selectedApiKey = await ApiKeyModel.findOne({ apiKey: xss(sanitize(req.body.apiKey)) });
        let tmpContent = [];
        let uniqueFileName;
        let savePath;
        let finishedURL;

        const session = sanitize(req.body.session);
        if (session) {
            req.session.client = {
                clientIdentifier: xss(session.clientIdentifier),
                authMethod: xss(session.authMethod),
                clientSpecificData: xss(session.clientSpecificData),
                uniqueFileName: xss(session.uniqueFileName)
            };
        } else {
            req.session.client = {
                clientIdentifier: captchaIdentifier,
                authMethod: "drawing-captcha",
                uniqueFileName: null,
                itemAssets: {}
            };
        }

        if (!globalPool || globalPool.length === 0) {
            console.error("Pool is empty or not initialized.");
            return res.status(500).json({ error: 'Pool is empty or not initialized.' });
        }

        if (selectedApiKey && selectedApiKey.companies != null && selectedApiKey.companies != "") {
            globalPool.forEach(item => {
                if (item.companies.some(company => selectedApiKey.companies.includes(company))) {
                    tmpContent.push(item);
                }
            });
            if (tmpContent.length === 0 || tmpContent === null) {
                setNotCategorized();
            }
        } else {
            setNotCategorized();
        }

        function setNotCategorized() {
            globalPool.forEach(item => {
                if (item.companies === null || item.companies.length === 0) {
                    tmpContent.push(item);
                }
            });
        }

        const randomIndex = Math.floor(Math.random() * tmpContent.length);
        const selectedContent = tmpContent[randomIndex];

        req.session.captchaSession = {
            CaptchaIdentifier: captchaIdentifier,
            ID: selectedContent.ID,
            imgURL: selectedContent.URL,
            Name: selectedContent.Name,
            expectedFields: selectedContent.ValidateF,
            FileName: selectedContent.FileName,
            Path: selectedContent.Path,
            minToleranceOfPool: selectedContent.MinTolerance,
            maxToleranceOfPool: selectedContent.MaxTolerance,
        };

        if (req.session.captchaSession.imgURL) {
            const imageBase64 = req.session.captchaSession.imgURL;
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            uniqueFileName = generateUniqueName.generateUniqueName(`${uuid.v4()}.png`);

            savePath = `./tmpimg/${uniqueFileName}`;

            fs.writeFile(savePath, imageBuffer, (err) => {
                if (err) {
                    console.error(`Error saving file: ${err}`);
                    return res.status(500).json({ error: 'Error saving file.' });
                } else {
                    console.log(`File successfully saved at: ${savePath}`);
                }
            });
        } else {
            console.error("client.imgURL is undefined");
            return res.status(500).json({ error: 'client.imgURL is undefined.' });
        }

        finishedURL = `/tmpimg/${uniqueFileName}`;

        req.session.client.itemAssets = {
            itemTitle: selectedContent.todoTitle,
            backgroundSize: selectedContent.backgroundSize,
            finishedURL: finishedURL
        };

        req.session.client.uniqueFileName = uniqueFileName;

        res.json({ client: req.session.client });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Server request error.' });
    }
});

router.post('/checkCubes', async (req, res) => {
    try {
        const givenSession = xss(sanitize(req.body.session));
        const existSession = await store.collection.findOne({
            'session.client.clientIdentifier': givenSession.clientIdentifier
        });
        console.log("existSession", existSession);

        const selectedFields = sanitize(req.body.selectedIds);

        if (!existSession) {
            console.info('Client data not found', givenSession.clientIdentifier);
            return res.status(400).json({ isValid: false });
        }

        const client = existSession.session.captchaSession;
        if (!client) {
            console.info('Client data not found', givenSession.clientIdentifier);
            return res.status(400).json({ isValid: false });
        }

        const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
        const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

        const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

        const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

        if (isValid) {
            if (existSession.session.captchaValidated) {
                console.log("Captcha already validated for clientIdentifier:", givenSession.clientIdentifier);
                return res.status(400).json({ isValid: false });
            }
            else {
                existSession.session.captchaValidated = true;
                console.log("Captcha solved successfully for clientIdentifier:", givenSession.clientIdentifier, "origin", req.headers.origin);
                existSession.session.captchaValidatedTime = Date.now();
            }
        } else {
            await store.collection.deleteOne({ 'session.client.clientIdentifier': givenSession.clientIdentifier });
        }
        //leaved in for future feature remember client that solved the captcha
        await store.collection.updateOne({ 'session.client.clientIdentifier': givenSession.clientIdentifier }, { $set: { 'session.captchaValidated': existSession.session.captchaValidated, 'session.captchaValidatedTime': existSession.session.captchaValidatedTime } });

        if (existSession.session.client.uniqueFileName) {
            const filePath = `./tmpimg/${existSession.session.client.uniqueFileName}`;
            const resolvedPath = path.resolve(filePath);
            if (resolvedPath.startsWith(__dirname + '/tmpimg')) {
                await deleteFile.deleteFile(resolvedPath);
            } else {
                console.error("Path traversal attempt detected:", filePath);
            }
        }
        if (isValid) {
            const JWTToken = await generateJWTToken();
            console.log("Generated JWT token:", JWTToken, "for clientIdentifier:", givenSession.clientIdentifier, "origin", req.headers.origin);
            res.json({ isValid, token: JWTToken });
        } else {
            res.json({ isValid });
        }
    } catch (error) {
        console.error("Error while validating captcha:", error);
        return res.status(500).json({ error: 'Error while validating captcha.' });
    }
});

router.post('/check-captcha', async (req, res) => {
    try {
        const givenSession = sanitize(req.body.session);
        const apiKey = xss(sanitize(req.body.apiKey));
        const apiKeyDB = await ApiKeyModel.findOne({ apiKey });
        const companyId = apiKeyDB.companies[0];
        let memorizeCaptcha = false;
        let colorKit = await ColorKit.findOne({ company: companyId });
        if (colorKit) {
            memorizeCaptcha = colorKit.memorizeCaptcha;
        }
        if (!givenSession || typeof givenSession.clientIdentifier === 'undefined') {
            return res.json({ valid: false });
        }
        const existSession = await store.collection.findOne({
            'session.client.clientIdentifier': givenSession.clientIdentifier
        });

        if (!existSession) {
            return res.status(400).json({ error: 'Client data not found' });
        }
        const { captchaValidated, captchaValidatedTime } = existSession.session;

        if (!captchaValidated) {
            return res.json({ valid: false });
        }
        if (!memorizeCaptcha) {
            store.collection.deleteOne({ 'session.client.clientIdentifier': givenSession.clientIdentifier });
            return res.json({ valid: false });
        }
        const thirtyMinutes = 30 * 60 * 1000;
        const currentTime = Date.now();

        const isValid = (currentTime - captchaValidatedTime) < thirtyMinutes;
        res.json({ valid: isValid });
    } catch (error) {
        console.error("Error while checking captcha:", error);
        return res.status(500).json({ error: 'Error while checking captcha.' });
    }
});

module.exports = router;
