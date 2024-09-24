const express = require('express');
const path = require("path");
const { promises: fsPromises } = require('fs');
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const uuid = require('uuid');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const ColorKit = require("../models/ColorKit.js");
const generateUniqueName = require("../services/generateUniqueName.js")
const deleteFile = require("../services/deleteFiles.js");
const { pool, initializePool } = require('../controllers/initializeController.js');
const store = require('../models/store.js');


const defaultColorKit = {
    buttonColorValue: "#007BFF",
    buttonColorHoverValue: "#0056b3",
    selectedCubeColorValue: "#ffff00",
    canvasOnHoverColorValue: "#ff0000",
    defaultTitle: "Please draw the object currently being displayed."
}
const ApiKeyModel = require("../models/ApiKey.js")

router.post('/reload', csrfMiddleware.validateCSRFOrExternalKey, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "You have exceeded the maximum number of requests for this endpoint. Please try again later."
}), (req, res) => {
    if (req.body.session && req.body.session.uniqueFileName) {
        req.session.uniqueFileName = req.body.session.uniqueFileName;
    }
    deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`)

});

router.post("/captchaSettings", csrfMiddleware.validateCSRFOrExternalKey, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "You have exceeded the maximum number of requests for this endpoint. Please try again later."
}), async (req, res) => {
    try {
        let apiKey = req.body.apiKey
        let apiKeyDB = await ApiKeyModel.findOne({ apiKey })
        let companyId = apiKeyDB.companies[0]
        console.log("captcha settings getting fetched..")
        let returnedColorKit
        let message
        let colorKit = await ColorKit.findOne({ company: companyId });
        if (colorKit) {
            message = "ColorKit found"
            console.log(message)
            returnedColorKit = colorKit
        } else {
            message = "No ColorKit found returned the default color Kit"
            console.log(message);
            returnedColorKit = defaultColorKit
        }

        res.status(200).json({ returnedColorKit, message });

    } catch (err) {
        console.error("Error while processing request:", err);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

router.post('/assets', csrfMiddleware.validateCSRFOrExternalKey, rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "You have exceeded the maximum number of requests for this endpoint. Please try again later."
}), async (req, res) => {

    let globalPool = await initializePool()
    try {

        let captchaIdentifier = uuid.v4();
        let selectedApiKey = await ApiKeyModel.findOne({ apiKey: req.body.apiKey });
        let tmpContent = []
        let uniqueFileName;
        let savePath;
        let finishedURL;

        if (req.body.session) {
            if (req.body.session) {
                req.session.client = {
                    clientIdentifier: req.body.session.clientIdentifier,
                    authMethod: req.body.session.authMethod,
                    clientSpecificData: req.body.session.clientSpecificData,
                    uniqueFileName: req.body.session.uniqueFileName
                };
            }
        }
        else {
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
                    tmpContent.push(item)
                }
            })
            if (tmpContent.length === 0 || tmpContent === null) {
                setNotCategorized()
            }
        }
        else {
            setNotCategorized()
        }

        function setNotCategorized() {
            globalPool.forEach(item => {
                if (item.companies === null || item.companies.length === 0) {
                    tmpContent.push(item)
                }
            })
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
        }

        req.session.client.uniqueFileName = uniqueFileName;

        res.json({ client: req.session.client });


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Server request error.' });
    }

});
router.post('/checkCubes', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "You have exceeded the maximum number of requests for this endpoint. Please try again later."
}), csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
    let givenSession = req.body.session;
    let existSession = await store.collection.findOne({
        'session.client.clientIdentifier': givenSession.clientIdentifier
    })

    const selectedFields = req.body.selectedIds;

    if (!existSession) {
        return res.status(400).json({ error: 'Client data not found' });
    }

    const client = existSession.session.captchaSession;
    if (!client) {
        return res.status(400).json({ error: 'Client data not found' });
    }

    const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
    const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

    const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

    const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

    if (isValid) {
        existSession.session.captchaValidated = true;
        existSession.session.captchaValidatedTime = Date.now();
    }

    try {
        await store.collection.updateOne({ 'session.client.clientIdentifier': givenSession.clientIdentifier}, { $set: { 'session.captchaValidated': existSession.session.captchaValidated, 'session.captchaValidatedTime': existSession.session.captchaValidatedTime } });
    } catch (error) {
        console.error("Error while updating session:", error);
        return res.status(500).json({ error: 'Error while updating session.' });
    }

    res.json({ isValid });

    if (existSession.session.client.uniqueFileName) {
        deleteFile.deleteFile(`./tmpimg/${existSession.session.client.uniqueFileName}`);
    }
});

router.post('/check-captcha', csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
    console.log("checkcaptcha")
    const givenSession = req.body.session;
    if(!req.body.session){
        res.json({ valid: false });
    }
    const existSession = await store.collection.findOne({
        'session.client.clientIdentifier': givenSession.clientIdentifier
    })

    if (!existSession) {
        return res.status(400).json({ error: 'Client data not found' });
    }

    const validated = existSession.session.captchaValidated;
    const validatedTime = existSession.session.captchaValidatedTime;

    if (!validated) {
        res.json({ valid: false });
        return;
    }

    const thirtyMinutes = 30 * 60 * 1000;
    const currentTime = Date.now();

    if ((currentTime - validatedTime) < thirtyMinutes) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});




module.exports = router