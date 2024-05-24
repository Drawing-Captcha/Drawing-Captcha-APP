const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const ApiKeyModel = require("./models/ApiKey.js")
const AllowedOriginModel = require("./models/AllowedOrigins.js");
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const csrf = require('csurf');
const { promises: fsPromises } = require('fs');
const cookieParser = require('cookie-parser');
const ColorKit = require("./models/ColorKit.js");
const connectDB = require("./config/db.js")
const isAuth = require("./middlewares/authMiddleware.js")
const {generateCSRFToken, validateCSRFToken, validateCSRFOrExternalKey} = require("./middlewares/csurfMiddleware.js")
const deleteAndLog = require("./services/deleteAndLog.js")
const {deletedBin, allowedOrigins, defaultOrigin, initializeAllowedOrigins, initializeBin} = require("./controllers/initializeController.js")
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const port = process.env.PORT;
connectDB()
setInterval(deleteAndLog, 1000 * 60 * 60 * 24);
let pool
initializePool().then(() => {
    console.log("pool initialized")
});

const app = express();
deleteAllFilesInDir("./tmpimg").then(console.log("All files deleted in ./tmpimg"))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use('/tmpimg', express.static('tmpimg'));
app.use(bodyParser.json());
app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || defaultOrigin.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const mongoURI = process.env.MONGO_URI
const store = new MongoDBSession({
    uri: mongoURI,
    collection: "mySessions",
})

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: store,
}));

const indexRoutes = require("./routes/index.js")
const authRoutes = require("./routes/auth.js")
const captchaRoutes = require("./routes/captcha.js")
const dashboardRoutes = require("./routes/dashboard.js")

app.use('/', indexRoutes);
app.use('/auth', authRoutes)
app.use('/captcha', captchaRoutes)
app.use('/dashboard', dashboardRoutes)

app.put("/apiKey", isAuth, validateCSRFToken, async (req, res) => {
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


app.get("/apiKey", isAuth, validateCSRFToken, async (req, res) => {
    try {
        let apiKeys = await ApiKeyModel.find();
        res.json({ apiKeys });
    } catch (error) {
        console.error("Error fetching API keys:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/apiKey/deleteAll", isAuth, validateCSRFToken, async (req, res) => {
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

app.post("/apiKey", isAuth, validateCSRFToken, async (req, res) => {
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


app.get("/dashboard", isAuth, validateCSRFToken, (req, res) => {
    res.render("dashboard", { username: req.session.user.username, email: req.session.user.email });
})

app.get("/dashboard/captchaSettings", isAuth, validateCSRFToken, (req, res) => {
    res.render("captchaSettings", { username: req.session.user.username, email: req.session.user.email });
})

app.post("/dashboard/captchaSettings", isAuth, validateCSRFToken, async (req, res) => {
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

app.get("/dashboard/createItem", isAuth, validateCSRFToken, (req, res) => {
    res.render("createItem", { username: req.session.user.username, email: req.session.user.email });
})

app.post("/logout", isAuth, validateCSRFToken, (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login")
    })
})

app.get('/dashboard/deletedArchive', isAuth, validateCSRFToken, (req, res) => {
    res.render("deletedArchive", { username: req.session.user.username, email: req.session.user.email })
})

app.put('/deletedArchive', isAuth, validateCSRFToken, (req, res) => {
    initializePool();
    initializeBin();
    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index
    console.log(tmpPool)
    if (Array.isArray(tmpPool)) {
        tmpPool.map(x => {
            index = pool.findIndex(b => b.ID === x.ID);
        });

        if (req.body.isDelete) {
            deletedObject = deletedBin.splice(index, 1)[0];
            fs.writeFile('./src/deletedBin.txt', JSON.stringify(deletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });
            initializeBin();

        } else {
            deletedObject = deletedBin.splice(index, 1)[0];
            pool.push(deletedObject)

            fs.writeFile('./src/pool.txt', JSON.stringify(pool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });
            fs.writeFile('./src/deletedBin.txt', JSON.stringify(deletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });
            initializePool();
            initializeBin();
        }

        isGood = true;
    } else {
        console.error("Problem with the array")
    }




    res.json({ isGood })
})

app.get('/deletedArchive', isAuth, validateCSRFToken, (req, res) => {
    initializeBin();
    if (deletedBin) {
        res.json({ deletedBin });
    }
    else console.error("deletedBin not defined")
});

app.post('/newValidation', isAuth, validateCSRFToken, (req, res) => {
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
                tmpPool = tmpPool.concat(pool);
            }

            const jsonContent = JSON.stringify(tmpPool, null, 2);
            fs.writeFile('./src/pool.txt', jsonContent, 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                    isValid = false;
                } else {
                    console.log('Data added to pool.txt.');
                }
                res.json({ isValid });
            });
        });
    } else {
        console.log("Error retrieving data from client");
        res.json({ isValid });
    }
});

app.post('/newValidation/nameExists', isAuth, validateCSRFToken, (req, res) => {
    let nameExists = false;
    pool.forEach(item => {
        if (item.Name === req.body.sessionComponentName) {
            nameExists = true;
            return;
        }
    });
    res.json({ nameExists });
});

app.get('/allowedOrigins', isAuth, validateCSRFToken, async (req, res) => {
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
app.post('/allowedOrigins', isAuth, validateCSRFToken, async (req, res) => {
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


app.put("/allowedOrigins", isAuth, validateCSRFToken, async (req, res) => {
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


app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
    store.collection.deleteMany({}, (err) => {
        if (err) {
            console.error('Error while trying to delete Sessions:', err);
        } else {
            console.log('All Sessions successfully.');
        }
    });
});

async function deleteAllFilesInDir(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);

        const deleteFilePromises = files.map(async (file) => {
            const filePath = path.join(dirPath, file);
            await fs.promises.unlink(filePath);
        });

        await Promise.all(deleteFilePromises);
    } catch (err) {
        console.log(err);
    }
}

async function doesApiKeyExist(key) {
    let apiKeyExists = await ApiKeyModel.findOne({ apiKey: key })
    return apiKeyExists;
}

async function initializePool() {
    try {
        const poolFilePath = path.join(__dirname, './src/pool.txt');
        const contents = await fsPromises.readFile(poolFilePath, 'utf-8');
        if (contents.trim() === "") {
            console.log("The file pool.txt is empty");
            pool = [];
        } else {
            pool = JSON.parse(contents);
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        pool = [];
    }
}