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
const {pool, initializePool} = require('../controllers/initializeController.js');
const captchaSession = new Map();
const defaultColorKit = {
    buttonColorValue: "#007BFF",
    buttonColorHoverValue: "#0056b3",
    selectedCubeColorValue: "#ffff00",
    canvasOnHoverColorValue: "#ff0000",
    defaultTitle: "Please draw the object currently being displayed."
}

router.post('/reload', csrfMiddleware.validateCSRFOrExternalKey, (req, res) => {
    if (req.body.session && req.body.session.uniqueFileName) {
        req.session.uniqueFileName = req.body.session.uniqueFileName;
    }
    deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`)

});

router.post("/captchaSettings", csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
    try {
        console.log("captcha settings getting fetched..")
        let returnedColorKit
        let message
        let colorKit = await ColorKit.findOne({});
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
    
    try {
        let globalPool = await initializePool()

        if (req.body.session) {
            req.session.cookie = req.body.session.cookie;
            req.session.authMethod = req.body.session.authMethod;
            req.session.apiKey = req.body.session.apiKey;
            req.session.clientSpecificData = req.body.session.clientSpecificData;
            req.session.uniqueFileName = req.body.session.uniqueFileName;

        }
        const captchaIdentifier = uuid.v4();
        console.log(captchaIdentifier)

        if (!globalPool || globalPool.length === 0) {
            console.error("Pool is empty or not initialized.");
            return res.status(500).json({ error: 'Pool is empty or not initialized.' });
        }

        const randomIndex = Math.floor(Math.random() * globalPool.length);
        const selectedContent = globalPool[randomIndex];

        captchaSession.set(captchaIdentifier, {
            ID: selectedContent.ID,
            imgURL: selectedContent.URL,
            Name: selectedContent.Name,
            expectedFields: selectedContent.ValidateF,
            FileName: selectedContent.FileName,
            Path: selectedContent.Path,
            minToleranceOfPool: selectedContent.MinTolerance,
            maxToleranceOfPool: selectedContent.MaxTolerance,
        });

        let client = captchaSession.get(captchaIdentifier);
        req.session.clientSpecificData = {
            ID: captchaIdentifier,
        };

        let clientData = req.session.clientSpecificData;

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

        res.json({ finishedURL, clientData, session: req.session, itemAssets});


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Server request error.' });
    }

});

router.post('/checkCubes', csrfMiddleware.validateCSRFOrExternalKey, async (req, res) => {
    const selectedFields = req.body.selectedIds;
    const selectedId = req.body.clientData.ID;
    if (req.body.session && req.body.session.uniqueFileName) {
        console.log("body session", req.body.session.uniqueFileName)
        req.session.uniqueFileName = req.body.session.uniqueFileName;
    }
    console.log("unique file name: ", req.session)

    let client = captchaSession.get(selectedId);

    if (client) {
        const expectedFieldsMinTolerance = Math.ceil(Number(client.minToleranceOfPool) * client.expectedFields.length);
        const selectedFieldsMaxTolerance = Math.ceil(Number(client.maxToleranceOfPool) * client.expectedFields.length);

        const successfullySelectedFields = selectedFields.filter(selectedField => client.expectedFields.includes(selectedField)).length;

        const isValid = successfullySelectedFields >= expectedFieldsMinTolerance && selectedFields.length <= selectedFieldsMaxTolerance;

        console.log({
            isValid,
            expectedFields: client.expectedFields,
            successfullySelectedFields,
            expectedFieldsMinTolerance,
            selectedFieldsLength: selectedFields.length,
            selectedFieldsMaxTolerance
        });

        res.json({ isValid });
    } else {
        res.status(400).json({ error: 'Client data not found' });
    }

    console.log("Deleting: ", req.session.uniqueFileName)
    deleteFile.deleteFile(`./tmpimg/${req.session.uniqueFileName}`)

    captchaSession.delete(selectedId);
});


module.exports = router