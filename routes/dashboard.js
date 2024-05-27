const path = require("path");
const { promises: fsPromises } = require('fs');
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
 
router.get('/getElements', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let globalPool = await initializePool()
    console.log("global: ", globalPool)
    if (globalPool) {
        res.json({ globalPool });
    }
    else console.error("pool not defined");
});

router.put("/crud", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let globalPool = await initializePool()
    let globalDeletedBin = await initializeBin()

    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index
    console.log("tmpPool", tmpPool);
    if (Array.isArray(tmpPool)) {
        tmpPool.map(x => {
            index = globalPool.findIndex(b => b.ID === x.ID);
        });

        if (req.body.isDelete) {
            deletedObject = globalPool.splice(index, 1)[0];
            console.log("deleted object: ", deletedObject)
            console.log("current pool: ", globalPool)
            globalDeletedBin.push(deletedObject)

            fs.writeFile('./src/deletedBin.txt', JSON.stringify(globalDeletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });

            fs.writeFile('./src/pool.txt', JSON.stringify(globalPool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });
        } else {
            globalPool[index].Name = tmpPool[0].Name
            globalPool[index].ValidateF = tmpPool[0].ValidateF
            globalPool[index].validateMinCubes = tmpPool[0].validateMinCubes
            globalPool[index].validateMaxCubes = tmpPool[0].validateMaxCubes
            globalPool[index].MaxTolerance = (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length;
            globalPool[index].MinTolerance = (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length;
            globalPool[index].todoTitle = tmpPool[0].todoTitle
            globalPool[index].backgroundSize = tmpPool[0].backgroundSize

            fs.writeFile('./src/pool.txt', JSON.stringify(globalPool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });

        }

        isGood = true;
    } else {
        console.error("Problem with the array")
    }
    res.json({ isGood })

})

router.get('/deletedArchive', authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("deletedArchive", { username: req.session.user.username, email: req.session.user.email })
})

router.put('/deletedArchive', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let globalPool = await initializePool()
    let globalDeletedBin = await initializeBin()

    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index
    console.log("given pool: ", tmpPool)
    if (Array.isArray(tmpPool)) {
        tmpPool.map(x => {
            index = globalDeletedBin.findIndex(b => b.ID === x.ID);
            console.log("index of pool: ", index)
        });
        deletedObject = console.log("spliced index: ", globalDeletedBin.splice(index, 1)[0]);
        if (req.body.isDelete) {
            fs.writeFile('./src/deletedBin.txt', JSON.stringify(globalDeletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });
        } else {
            globalPool.push(deletedObject)

            fs.writeFile('./src/pool.txt', JSON.stringify(globalPool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });
            fs.writeFile('./src/deletedBin.txt', JSON.stringify(globalDeletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });
        }

        isGood = true;
    } else {
        console.error("Problem with the array")
    }
    res.json({ isGood })
})

router.get('/deletedArchiveAssets', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let globalDeletedBin = await initializeBin()
    if (globalDeletedBin) {
        res.json({ globalDeletedBin });
    }
    else console.error("deletedBin not defined")
});

router.get("/apiKeySection", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {

    res.render("apiKeys", { username: req.session.user.username, email: req.session.user.email });

})

router.put("/apiKey", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
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
        res.json({ apiKeys });
    } catch (error) {
        console.error("Error fetching API keys:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/apiKey/deleteAll", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
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

router.post("/apiKey", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    let successfully;
    let message;
    try {
        let name = req.body.apiKeyName;
        let doesNameExist = await ApiKeyModel.findOne({ name: name });
        if (!doesNameExist) {
            let apiKey = crypto.randomUUID();
            while ((await doesApiKeyExist(apiKey))) {
                apiKey = crypto.randomUUID();
            }
            api = new ApiKeyModel({
                apiKey,
                name
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

router.get("/", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("dashboard", { username: req.session.user.username, email: req.session.user.email });
})

router.get("/captchaSettings", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("captchaSettings", { username: req.session.user.username, email: req.session.user.email });
})

router.post("/captchaSettings", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
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

router.get("/createItem", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    res.render("createItem", { username: req.session.user.username, email: req.session.user.email });
})

router.post("/logout", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login")
    })
})

router.post('/newValidation', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    initializePool()
    let globalPool = await initializePool()
    const ID = crypto.randomUUID();
    const validateTrueCubes = req.body.validateTrueCubes;
    const validateMinCubes = req.body.validateMinCubes;
    const validateMaxCubes = req.body.validateMaxCubes;
    const componentName = req.body.sessionComponentName;
    const backgroundImage = req.body.backgroundImage;
    const todoTitle = req.body.todoTitle;
    const backgroundSize = req.body.backgroundSize;

    let isValid = false;

    if (validateTrueCubes && validateMinCubes && validateMaxCubes && componentName) {
        isValid = true;

        const MaxTolerance = (validateMaxCubes.length * 1) / validateTrueCubes.length;
        const MinTolerance = (validateMinCubes.length * 1) / validateTrueCubes.length;

        fs.readFile('./src/pool.txt', 'utf-8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Error reading pool.txt:', err);
                isValid = false;
                res.json({ isValid });
                return;
            }

            let tmpPool = [
                {
                    "ID": ID,
                    "Name": componentName,
                    "URL": backgroundImage,
                    "MaxTolerance": MaxTolerance,
                    "MinTolerance": MinTolerance,
                    "ValidateF": validateTrueCubes,
                    "validateMinCubes": validateMinCubes,
                    "validateMaxCubes": validateMaxCubes,
                    "todoTitle": todoTitle,
                    "backgroundSize": backgroundSize
                }
            ];

            console.log(tmpPool)

            if (data) {
                const pool = JSON.parse(data);
                tmpPool = tmpPool.concat(globalPool);
            }

            const jsonContent = JSON.stringify(tmpPool, null, 2);
            fs.writeFile('./src/pool.txt', jsonContent, 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                    isValid = false;
                } else {
                    console.log('Data added to pool.txt.');
                }
                initializePool()

                res.json({ isValid });
            });
        });
    } else {
        console.log("Error retrieving data from client");
        res.json({ isValid });
    }
});

router.post('/newValidation/nameExists', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
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
        if (allowedOrigins.length > 0) {
            message = "allowed origins found"
            console.log(message)
        }
        else {
            message = "no allowed origins found"
            console.log(message);
        }

        res.json({ allowedOrigins, message })
    }
    catch (err) {
        console.log("Error while trying to get AllowedOrigins", err);
        return res.status(500).json({ error: "An error occurred while trying to get the AllowedOrigins" });
    }

})
router.post('/allowedOrigins', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        let message;
        let originName = req.body.originName;
        let doesOriginExist = await AllowedOriginModel.findOne({ allowedOrigin: originName });
        console.log(doesOriginExist)
        if (originName && !doesOriginExist) {
            let origin = new AllowedOriginModel({
                allowedOrigin: originName
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


router.put("/allowedOrigins", authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
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