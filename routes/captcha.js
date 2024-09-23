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
const captchaSession = new Map();
const defaultColorKit = {
    buttonColorValue: "#007BFF",
    buttonColorHoverValue: "#0056b3",
    selectedCubeColorValue: "#ffff00",
    canvasOnHoverColorValue: "#ff0000",
    defaultTitle: "Please draw the object currently being displayed."
}
const ApiKeyModel = require("../models/ApiKey.js")

router.post('/reload', csrfMiddleware.validateCSRFOrExternalKey, (req, res) => {
    if (req.body.session && req.body.session.uniqueFileName) {
        req.session.uniqueFileName = req.body.session.uniqueFileName;
    }
    deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`)

});

router.post("/captchaSettings", csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
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
        console.log("returned colorKit: ", returnedColorKit);

        res.status(200).json({ returnedColorKit, message });

    } catch (err) {
        console.error("Error while processing request:", err);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

router.post('/getAssets', csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {

    let globalPool = await initializePool()
    try {
        const captchaIdentifier = uuid.v4();
        let apiKeys = await ApiKeyModel.find();
        if (req.body.session) {
            req.session.cookie = req.body.session.cookie;
            req.session.authMethod = req.body.session.authMethod;
            req.session.apiKey = req.body.session.apiKey;
            req.session.clientSpecificData = req.body.session.clientSpecificData;
            req.session.uniqueFileName = req.body.session.uniqueFileName;

        }

        if (!globalPool || globalPool.length === 0) {
            console.error("Pool is empty or not initialized.");
            return res.status(500).json({ error: 'Pool is empty or not initialized.' });
        }

        let tmpContent = []
        let selectedApiKey
        apiKeys.forEach(key => {
            if (req.body.apiKey === key.apiKey) {
                selectedApiKey = key
            }
        })
        let companyId = selectedApiKey.companies[0]

        console.log("requested key: ", req.body.apiKey)
        console.log("returned key: ", selectedApiKey)

        if (req.body.apiKey) {
            if (selectedApiKey && selectedApiKey.companies != null && selectedApiKey.companies != "") {
                console.log("returned categorized to client")
                globalPool.forEach(item => {
                    if (item.companies.some(company => selectedApiKey.companies.includes(company))) {
                        tmpContent.push(item)
                    }
                })
                console.log("TMP Content: ", tmpContent)
                if (tmpContent.length === 0 || tmpContent === null) {
                    setNotCategorized()
                }
            }
            else {
                setNotCategorized()
            }
        }
        else {
            setNotCategorized()
        }

        function setNotCategorized() {
            console.log("returned not categorized to client")
            globalPool.forEach(item => {
                if (item.companies === null || item.companies.length === 0) {
                    tmpContent.push(item)
                }
            })
        }

        console.log(tmpContent)
        const randomIndex = Math.floor(Math.random() * tmpContent.length);
        const selectedContent = tmpContent[randomIndex];

        console.log("selectedContent: ", selectedContent)

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
        let client = req.session.captchaSession;

        req.session.clientSpecificData = {
            ID: captchaIdentifier,
        };

        //Session based solution





        // hier weiter machen



        // let clientData = req.session.clientSpecificData;

        let itemAssets = {
            itemTitle: selectedContent.todoTitle,
            backgroundSize: selectedContent.backgroundSize
        }

        let uniqueFileName;
        let savePath;

        if (client.imgURL) {
            const imageBase64 = client.imgURL;
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            uniqueFileName = generateUniqueName.generateUniqueName(`${uuid.v4()}.png`);
            req.session.uniqueFileName = uniqueFileName;

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

        const finishedURL = `/tmpimg/${uniqueFileName}`;
//Nicht die gesamte session zurückgeben!!!!!!
        res.json({ finishedURL, clientData, session: req.session, itemAssets });


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Server request error.' });
    }

});

router.post('/checkCubes', csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
    try {
        const selectedFields = req.body.selectedIds;
        const selectedId = req.body.clientData.ID;

        if (req.body.session && req.body.session.uniqueFileName) {
            req.session.uniqueFileName = req.body.session.uniqueFileName;
        }

        const client = captchaSession.get(selectedId);

        if (!client) {
            return res.status(400).json({ error: 'Client data not found' });
        }

        const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
        const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

        const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

        const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

        if (isValid) {
            req.session.captchaValidated = true;
            req.session.captchaValidatedTime = Date.now();
        }

        res.json({ isValid });

        if (req.session.uniqueFileName) {
            deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`);
        }

        captchaSession.delete(selectedId);

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/check-captcha', (req, res) => {
    const validated = req.session.captchaValidated;
    const validatedTime = req.session.captchaValidatedTime;

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