const express = require('express');
const path = require("path");
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
const sanitizeInput = require("../services/sanitizeInput.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const mongoSanitize = require('mongo-sanitize');
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
    try {
        const session = req.body?.session;
        if (session) {
            const uniqueFileName = sanitizeInput(session.uniqueFileName ?? "")
            if (uniqueFileName) {
                const resolvedPath = path.resolve(`./tmpimg/${uniqueFileName}`);
                if (resolvedPath) {
                    deleteFile.deleteFile(resolvedPath);
                } else {
                    logger.error("Path traversal attempt detected:", resolvedPath);
                }
            }
        }
    } catch (err) {
        logger.error("Error while reloading captcha", {
            message: err,
            stack: err.stack,
            name: err.name,
            path: req.originalUrl,
        });

        res.status(500).json({ message: "Error while reloading captcha" });
    }

});

router.post("/captchaSettings", async (req, res) => {
    try {
        const apiKey = sanitizeInput(req.body.apiKey);
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
        logger.error("Error while processing captcha settings request", err, {
            operation: 'get_captcha_settings',
            // file deepcode ignore HardcodedNonCryptoSecret: <ApiKey ist needed for Accountability and Security logging>
            apiKey: apiKey ? '[PRESENT]' : '[MISSING]',
            companyId: companyId || 'unknown'
        });
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

// file deepcode ignore NoRateLimitingForExpensiveWebOperation: <is being handled by the captchaLimiter middleware in app.js>
router.post('/assets', async (req, res) => {
    let globalPool = await initializePool();
    let captchaIdentifier = uuid.v4();
    try {
        let selectedApiKey = await ApiKeyModel.findOne({ apiKey: sanitizeInput(req.body.apiKey) });
        let tmpContent = [];
        let uniqueFileName;
        let savePath;
        let finishedURL;

        const session = req.body.session;
        if (session) {
            req.session.client = {
                clientIdentifier: sanitizeInput(session.clientIdentifier),
                authMethod: sanitizeInput(session.authMethod),
                clientSpecificData: session.clientSpecificData,
                uniqueFileName: sanitizeInput(session.uniqueFileName)
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
            logger.error("Pool is empty or not initialized", null, {
                operation: 'get_captcha_assets',
                clientIdentifier: captchaIdentifier
            });
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

        if (tmpContent.length === 0) {
            logger.warn("No valid content found in the pool", null, {
                operation: 'get_captcha_assets',
                clientIdentifier: captchaIdentifier
            });
            return res.status(500).json({ error: 'No valid content found in the pool.' });
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
                    logger.error("Error saving captcha image file", err, {
                        operation: 'save_captcha_image',
                        clientIdentifier: captchaIdentifier,
                        path: savePath
                    });
                    return res.status(500).json({ error: 'Error saving file.' });
                } else {
                    logger.info("File successfully saved", {
                        operation: 'save_captcha_image',
                        clientIdentifier: captchaIdentifier,
                        path: savePath,
                        uniqueFileName
                    });
                }
            });
        } else {
            logger.error("client.imgURL is undefined", null, {
                operation: 'get_captcha_assets',
                clientIdentifier: captchaIdentifier,
                selectedContentId: selectedContent?.ID
            });
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
        logger.error("Error getting captcha assets", err, {
            operation: 'get_captcha_assets',
            clientIdentifier: req.session.client?.clientIdentifier || captchaIdentifier,
            apiKey: sanitizeInput(req.body.apiKey) ? '[PRESENT]' : '[MISSING]'
        });
        return res.status(500).json({ error: 'Server request error.' });
    }
});

router.post('/checkCubes', async (req, res) => {
    const givenSession = req.body.session;
    const clientIdentifier = sanitizeInput(givenSession.clientIdentifier);
    try {
        const existSession = await store.collection.findOne({
            'session.client.clientIdentifier': clientIdentifier
        });
        logger.info("Found existing session for captcha check", {
            operation: 'check_captcha_cubes',
            clientIdentifier: clientIdentifier,
            sessionExists: !!existSession
        });

        const selectedFields = mongoSanitize(req.body.selectedIds);

        if (!existSession) {
            logger.warn('Client data not found', {
                operation: 'check_captcha_cubes',
                clientIdentifier: clientIdentifier
            });
            return res.status(400).json({ isValid: false });
        }

        const client = existSession.session.captchaSession;
        if (!client) {
            logger.warn('Client session data not found', {
                operation: 'check_captcha_cubes',
                clientIdentifier: clientIdentifier
            });
            return res.status(400).json({ isValid: false });
        }

        const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
        const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

        const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

        const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

        if (isValid) {
            if (existSession.session.captchaValidated) {
                logger.info("Captcha already validated", {
                    operation: 'check_captcha_cubes',
                    clientIdentifier: clientIdentifier,
                    status: 'already_validated'
                });
                return res.status(400).json({ isValid: false });
            }
            else {
                existSession.session.captchaValidated = true;
                logger.info("Captcha solved successfully", {
                    operation: 'check_captcha_cubes',
                    clientIdentifier: clientIdentifier,
                    origin: req.headers.origin,
                    status: 'validated'
                });
                existSession.session.captchaValidatedTime = Date.now();
            }
        } else {
            await store.collection.deleteOne({ 'session.client.clientIdentifier': clientIdentifier });
        }
        //leaved in for future feature remember client that solved the captcha
        await store.collection.updateOne({ 'session.client.clientIdentifier': clientIdentifier }, { $set: { 'session.captchaValidated': existSession.session.captchaValidated, 'session.captchaValidatedTime': existSession.session.captchaValidatedTime } });

        if (existSession.session.client.uniqueFileName) {
            const filePath = `./tmpimg/${existSession.session.client.uniqueFileName}`;
            const resolvedPath = path.resolve(filePath);
            if (resolvedPath) {
                await deleteFile.deleteFile(resolvedPath);
            } else {
                console.error("Path traversal attempt detected:", filePath);
            }
        }
        if (isValid) {
            const JWTToken = await generateJWTToken();
            logger.info("Generated JWT token for validated captcha", {
                operation: 'generate_jwt_token',
                clientIdentifier: clientIdentifier,
                origin: req.headers.origin,
                tokenGenerated: !!JWTToken
            });
            res.json({ isValid, token: JWTToken });
        } else {
            res.json({ isValid });
        }
    } catch (error) {
        logger.error("Error while validating captcha", error, {
            operation: 'check_captcha_cubes',
            clientIdentifier: givenSession?.clientIdentifier
        });
        return res.status(500).json({ error: 'Error while validating captcha.' });
    }
});

router.post('/check-captcha', async (req, res) => {
    const givenSession = req.body.session;
    try {
        const apiKey = sanitizeInput(req.body.apiKey);
        logger.request(req, `Checking captcha from ${req.ip} with apiKey: ${apiKey}`, {
            operation: 'check_captcha',
            clientIdentifier: givenSession?.clientIdentifier,
            apiKey: sanitizeInput(req.body.apiKey) ? '[PRESENT]' : '[MISSING]',
        });
        const clientIdentifier = sanitizeInput(givenSession.clientIdentifier)
        const apiKeyDB = await ApiKeyModel.findOne({ apiKey });
        const companyId = apiKeyDB.companies[0];
        let memorizeCaptcha = false;
        let colorKit = await ColorKit.findOne({ company: companyId });
        if (colorKit) {
            memorizeCaptcha = colorKit.memorizeCaptcha;
        }
        if (!givenSession || typeof clientIdentifier === 'undefined') {
            return res.json({ valid: false });
        }
        const existSession = await store.collection.findOne({
            'session.client.clientIdentifier': clientIdentifier
        });

        if (!existSession) {
            return res.status(400).json({ error: 'Client data not found' });
        }
        const { captchaValidated, captchaValidatedTime } = existSession.session;

        if (!captchaValidated) {
            return res.json({ valid: false });
        }
        if (!memorizeCaptcha) {
            store.collection.deleteOne({ 'session.client.clientIdentifier': clientIdentifier });
            return res.json({ valid: false });
        }
        const thirtyMinutes = 30 * 60 * 1000;
        const currentTime = Date.now();

        const isValid = (currentTime - captchaValidatedTime) < thirtyMinutes;
        res.json({ valid: isValid });
    } catch (error) {
        logger.error("Error while checking captcha", error, {
            operation: 'check_captcha',
            clientIdentifier: givenSession?.clientIdentifier,
            apiKey: apiKey ? '[PRESENT]' : '[MISSING]',
            companyId: companyId || 'unknown'
        });
        return res.status(500).json({ error: 'Error while checking captcha.' });
    }
});

module.exports = router;
