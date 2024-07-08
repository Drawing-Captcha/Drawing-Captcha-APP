const path = require("path");
const { promises: fsPromises } = require('fs');
const mongoose = require('mongoose');
const fs = require("fs");
const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const ColorKit = require("../models/ColorKit.js");
const AllowedOriginModel = require("../models/AllowedOrigins.js");
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const { pool, deletedBin, initializeAllowedOrigins, initializePool, initializeBin } = require("../controllers/initializeController");
const ApiKeyModel = require("../models/ApiKey.js")
const doesApiKeyExist = require("../services/apiKeyExist.js")
const isAdmin = require("../middlewares/adminMiddleware.js")
const registerKeyModel = require("../models/RegisterKey.js")
const generateNewRegisterKey = require("../services/generateRegisterKey.js")
const notReadOnly = require("../middlewares/notReadOnly.js")
const CaptchaModel = require("../models/Captcha.js")
const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")
const CompanyModel = require("../models/Company.js")

router.get('/getElements', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        let globalPool = await initializePool()
        let userRole = req.session.user.role;
        let returnedPool

        if (globalPool) {
            if (userRole === "admin") {
                returnedPool = globalPool
            }
            else {
                returnedPool = []
                globalPool.forEach(item => {
                    if (item.companies === null || item.companies.length === 0 || item.companies.some(company => req.session.user.companies.includes(company))) {
                        returnedPool.push(item)
                    }
                })
            }
        } else {
            console.error("pool not defined");
        }

        res.json({ globalPool: returnedPool, userRole });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
});

router.get('/getElements/notCategorized', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        let globalPool = await initializePool()
        let userRole = req.session.user.role;
        let returnedPool

        if (globalPool) {
            returnedPool = []
            globalPool.forEach(item => {
                if (item.companies === null || item.companies.length === 0) {
                    returnedPool.push(item)
                }
            })
        }
        else {
            console.error("pool not defined");
        }


        res.json({ globalPool: returnedPool, userRole });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
});


router.put("/crud", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let globalPool = await initializePool();
    let globalDeletedBin = await initializeBin();

    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index;
    console.log("tmpPool", tmpPool);

    if (Array.isArray(tmpPool)) {
        tmpPool.forEach(x => {
            index = globalPool.findIndex(b => b.ID === x.ID);
        });

        if (req.body.isDelete) {
            deletedObject = globalPool.splice(index, 1)[0];
            console.log("deleted object: ", deletedObject);
            console.log("current pool: ", globalPool);

            globalDeletedBin.push(deletedObject);

            try {
                const found = await CaptchaModel.findOne({ ID: deletedObject.ID });

                if (found) {
                    await CaptchaModel.deleteOne({ ID: deletedObject.ID });

                    const deletedCaptcha = new DeletedCaptchaModel({
                        ...deletedObject.toObject(),
                        _id: new mongoose.Types.ObjectId(),
                    });

                    await deletedCaptcha.save();
                    console.log('Data added to deleted bin in MongoDB.');
                } else {
                    console.error('Document not found in Captcha collection:', deletedObject.ID);
                }
            } catch (err) {
                console.error('Error saving to deleted bin in MongoDB:', err);
            }
        } else {
            console.log("companies sent: ", tmpPool[0].companies)
            let updatedCaptcha = {
                Name: tmpPool[0].Name,
                ValidateF: tmpPool[0].ValidateF,
                validateMinCubes: tmpPool[0].validateMinCubes,
                validateMaxCubes: tmpPool[0].validateMaxCubes,
                MaxTolerance: (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length,
                MinTolerance: (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length,
                todoTitle: tmpPool[0].todoTitle,
                backgroundSize: tmpPool[0].backgroundSize,
                companies: tmpPool[0].companies
            };

            try {
                await CaptchaModel.updateOne({ ID: tmpPool[0].ID }, updatedCaptcha, { runValidators: true });
                console.log('Data updated in MongoDB.');
            } catch (err) {
                console.error('Error updating data in MongoDB:', err);
            }
        }

        isGood = true;
    } else {
        console.error("Problem with the array");
        isGood = false;
    }
    res.json({ isGood });
});



router.get('/deletedArchive', authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("deletedArchive", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL })
})

router.get('/notAuthorized', authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("notAuthorized", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role })
})

router.put('/deletedArchive', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let globalPool = await initializePool();
    let globalDeletedBin = await initializeBin();

    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index;
    console.log("given pool: ", tmpPool);

    if (Array.isArray(tmpPool)) {
        tmpPool.forEach(x => {
            index = globalDeletedBin.findIndex(b => b.ID === x.ID);
            console.log("index of pool: ", index);
        });

        if (req.body.isDelete) {
            deletedObject = globalDeletedBin.splice(index, 1)[0];
            try {
                await DeletedCaptchaModel.deleteOne({ ID: deletedObject.ID });
                console.log('Deleted object removed from MongoDB deleted bin.');
            } catch (err) {
                console.error('Error deleting from MongoDB deleted bin:', err);
            }
        } else {
            deletedObject = globalDeletedBin.splice(index, 1)[0];
            globalPool.push(deletedObject);

            try {
                await DeletedCaptchaModel.deleteOne({ ID: deletedObject.ID });
                const newCaptcha = new CaptchaModel({
                    ...deletedObject.toObject(),
                    _id: new mongoose.Types.ObjectId(),
                });
                await newCaptcha.save();
                console.log('Deleted object moved back to pool in MongoDB.');
            } catch (err) {
                console.error('Error moving object back to pool in MongoDB:', err);
            }
        }

        isGood = true;
    } else {
        console.error("Problem with the array");
        isGood = false;
    }
    res.json({ isGood });
});

router.get('/deletedArchiveAssets', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let globalDeletedBin = await initializeBin()
    let userRole = req.session.user.role
    if (globalDeletedBin) {
        res.json({ globalDeletedBin, userRole });
    }
    else console.error("deletedBin not defined")
});

router.get("/apiKeySection", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {

    res.render("apiKeys", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role });

})

router.put("/apiKey", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    if (req.body.isDelete) {
        let key = req.body.key;
        let isKeyDeleted = false;
        try {
            let keyExists = await ApiKeyModel.findOne({ apiKey: key });
            if (keyExists) {
                let keyDeleted = await ApiKeyModel.deleteOne({ apiKey: key });
                isKeyDeleted = true;
                if (keyDeleted.deletedCount === 0) {
                    throw new Error("Error deleting API key");
                }
            } else {
                return res.status(404).json({ error: "The given key does not exist" });
            }
        } catch (err) {
            console.log("Error while trying to delete API key ", err);
            return res.status(500).json({ error: "An error occurred while deleting the API key" });
        }
        res.json({ isKeyDeleted });
    } else {
        return res.status(400).json({ error: "Invalid request: 'isDelete' is not true" });
    }
});

router.get("/apiKey", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        let apiKeys = await ApiKeyModel.find();
        let userRole = req.session.user.role

        let returnedKeys

        if(userRole === "admin"){
            returnedKeys = apiKeys    
        }
        else{
            returnedKeys = []
            apiKeys.forEach(Key => {
                if(Key.companies === null || Key.companies.length === 0 || Key.companies.some(company => req.session.user.companies.includes(company))){
                    returnedKeys.push(Key)
                }
            })
        }

        res.json({ apiKeys: returnedKeys, userRole });
    } catch (error) {
        console.error("Error fetching API keys:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/apiKey/deleteAll", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let deleteAll;
    console.log("deleting all api keys....")
    try {
        const keys = await ApiKeyModel.find({});
        if (keys.length > 0) {
            const result = await ApiKeyModel.deleteMany({});
            if (result) {
                deleteAll = "All API keys have been successfully deleted."
            }
        }
        else {
            deleteAll = "No existing Keys"
        }

    }
    catch (err) {
        deleteAll = "The deletion of all API keys has failed."
    }

    console.log(deleteAll)

    res.json({ deleteAll })

})

router.post("/apiKey", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let successfully;
    let message;
    try {
        let name = req.body.apiKeyName;
        let selectedCompanies = req.body.selectedCompanies;
        let doesNameExist = await ApiKeyModel.findOne({ name: name });
        if (!doesNameExist) {
            let apiKey = crypto.randomUUID();
            while ((await doesApiKeyExist(apiKey))) {
                apiKey = crypto.randomUUID();
            }
            api = new ApiKeyModel({
                apiKey,
                name,
                companies: selectedCompanies
            })

            await api.save();
            successfully = true;


            message = "Successfully created an API Key"
            console.log(message)
        }
        else {
            successfully = false;
            message = "Api key name already exists"
            console.log(message)
        }

    }
    catch (err) {
        console.log("Creating a Api key failed ", err)
        successfully = false;
    }

    res.json({ successfully, message });
})

router.get("/", csrfMiddleware.validateCSRFToken, authMiddleware, (req, res) => {
    res.render("dashboard", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})

router.get("/captchaSettings", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("captchaSettings", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})

router.get("/registeredUsers", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("users", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})
router.get("/companies", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("company", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})

router.get("/registerKey", authMiddleware, isAdmin, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("registerKey", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})
router.get("/registerKey/assets", authMiddleware, isAdmin, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const registerKeyENV = process.env.REGISTER_KEY;
        const registerKeyDB = await registerKeyModel.findOne({});
        const returnedKey = registerKeyDB ? registerKeyDB.RegisterKey : registerKeyENV;

        console.log("returned Key", returnedKey);

        res.json({ returnedKey });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/registerKey", authMiddleware, isAdmin, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        generateNewRegisterKey(req, res);
    } catch (error) {
        console.error("Error handling register key:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


router.post("/captchaSettings", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        console.log(req.body)
        const {
            buttonColorValue,
            buttonColorHoverValue,
            selectedCubeColorValue,
            canvasOnHoverColorValue,
            defaultTitle,
            isResetColorKit
        } = req.body;

        let message;

        if (isResetColorKit) {
            let deletedKit = await ColorKit.deleteMany({});
            message = deletedKit ? "ColorKit has been reset to default" : "Failed to reset ColorKit to default";
        }
        else {

            let doesColorKitAlreadyExist = await ColorKit.findOne({});

            if (!doesColorKitAlreadyExist) {
                console.log("found one colorKit")
                let newColorKit = new ColorKit({
                    buttonColorValue,
                    buttonColorHoverValue,
                    selectedCubeColorValue,
                    canvasOnHoverColorValue,
                    defaultTitle
                });
                await newColorKit.save();
                message = "ColorKit has been created successfully."
            } else {
                await ColorKit.updateOne({}, {
                    buttonColorValue,
                    buttonColorHoverValue,
                    selectedCubeColorValue,
                    canvasOnHoverColorValue,
                    defaultTitle
                });
                console.log("update one colorKit")
                message = "ColorKit has been updated successfully."
            }
        }

        res.status(200).json({ message });

    } catch (err) {
        console.error("Error while processing request:", err);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

router.get("/createItem", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, (req, res) => {
    res.render("createItem", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL });
})

router.post("/logout", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login")
    })
})

router.post('/newValidation', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let globalPool = await initializePool();
    const ID = crypto.randomUUID();
    const validateTrueCubes = req.body.validateTrueCubes;
    const validateMinCubes = req.body.validateMinCubes;
    const validateMaxCubes = req.body.validateMaxCubes;
    const componentName = req.body.sessionComponentName;
    const backgroundImage = req.body.backgroundImage;
    const todoTitle = req.body.todoTitle;
    const backgroundSize = req.body.backgroundSize;
    const selectedCompanies = req.body.selectedCompanies

    let isValid = false;

    if (validateTrueCubes && validateMinCubes && validateMaxCubes && componentName) {
        isValid = true;

        const MaxTolerance = (validateMaxCubes.length * 1) / validateTrueCubes.length;
        const MinTolerance = (validateMinCubes.length * 1) / validateTrueCubes.length;

        const captchaData = {
            ID: ID,
            Name: componentName,
            URL: backgroundImage,
            MaxTolerance: MaxTolerance,
            MinTolerance: MinTolerance,
            ValidateF: validateTrueCubes,
            validateMinCubes: validateMinCubes,
            validateMaxCubes: validateMaxCubes,
            todoTitle: todoTitle,
            backgroundSize: backgroundSize,
            companies: selectedCompanies

        };

        console.log(captchaData);

        try {
            const newCaptcha = new CaptchaModel(captchaData);
            await newCaptcha.save();
            console.log('Data added to MongoDB');
        } catch (err) {
            console.error('Error saving to MongoDB:', err);
            isValid = false;
        }

        await initializePool();
        res.json({ isValid });
    } else {
        console.log("Error retrieving data from client");
        res.json({ isValid });
    }
});

router.post('/newValidation/nameExists', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    let globalPool = await initializePool()
    let nameExists = false;
    globalPool.forEach(item => {
        if (item.Name === req.body.sessionComponentName) {
            nameExists = true;
            return;
        }
    });
    res.json({ nameExists });
});


router.get('/allowedOrigins', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        let message;
        let allowedOrigins = await AllowedOriginModel.find({});
        let userRole = req.session.user.role;
        let returnedOrigins;

        allowedOrigins = allowedOrigins.filter(origin => !origin.initOrigin);

        if (allowedOrigins.length > 0) {
            if(userRole === "admin"){
                message = "allowed origins found";
                console.log(message);
                returnedOrigins = allowedOrigins;
            }
            else{
                returnedOrigins = [];
                allowedOrigins.forEach(Origin => {
                    if(Origin.companies === null || Origin.companies.length === 0 || Origin.companies.some(company => req.session.user.companies.includes(company))){
                        returnedOrigins.push(Origin);
                    }
                });
            }
        }
        else {
            message = "no allowed origins found";
            console.log(message);
        }

        res.json({ allowedOrigins: returnedOrigins, message, userRole });
    }
    catch (err) {
        console.log("Error while trying to get AllowedOrigins", err);
        return res.status(500).json({ error: "An error occurred while trying to get the AllowedOrigins" });
    }
})

router.post('/allowedOrigins', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        let message;
        let originName = req.body.originName;
        let selectedCompanies = req.body.selectedCompanies
        let doesOriginExist = await AllowedOriginModel.findOne({ allowedOrigin: originName });
        console.log(doesOriginExist)
        if (originName && !doesOriginExist) {
            let origin = new AllowedOriginModel({
                allowedOrigin: originName,
                companies: selectedCompanies
            });

            await origin.save();
            initializeAllowedOrigins();
            message = "Allowed origin successfully created";
            console.log(message);
        } else {
            message = `${originName} is undefined or already exists`;
            console.log(message);
        }

        res.json({ message });
    } catch (err) {
        console.log("Error while trying to create AllowedOrigins", err);
        return res.status(500).json({ error: "An error occurred while trying to create AllowedOrigins" });
    }
});

router.put("/allowedOrigins", authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    if (req.body.isDelete) {
        let origin = req.body.allowedOrigin;
        let isOriginDeleted = false;
        try {
            let originExists = await AllowedOriginModel.findOne({ allowedOrigin: origin });
            if (originExists) {
                let originDeleted = await AllowedOriginModel.deleteOne({ allowedOrigin: origin });
                isOriginDeleted = true;
                initializeAllowedOrigins();
                if (originDeleted.deletedCount === 0) {
                    throw new Error("Error deleting allowed Origin");
                }
            } else {
                return res.status(404).json({ error: "The given Origin does not exist" });
            }
        } catch (err) {
            console.log("Error while trying to delete allowed Origin ", err);
            return res.status(500).json({ error: "An error occurred while deleting the allowed origin" });
        }
        res.json({ isOriginDeleted });
    } else {
        return res.status(400).json({ error: "Invalid request: 'isDelete' is not true" });
    }
});

module.exports = router