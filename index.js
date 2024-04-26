const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const UserModel = require("./models/user.js");
const ApiKeyModel = require("./models/ApiKey.js")
const AllowedOriginModel = require("./models/AllowedOrigins.js");
const bcrypt = require("bcryptjs")
const { promises: fsPromises } = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 9090;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const uuid = require('uuid');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

setInterval(deleteAndLog, 1000 * 60 * 60 * 24);

let pool;
let deletedBin;
const captchaSession = new Map();
let defaultOrigin = [`http://localhost:${port}`];


async function initializeAllowedOrigins() {
    try {
        allowedOrigins = await AllowedOriginModel.find({});
        if (allowedOrigins.length > 0) {
            allowedOrigins.forEach(origin =>{
                defaultOrigin.push(origin.allowedOrigin)
            })
            console.log("Allowed origins: ", defaultOrigin);
        } else {
            console.log("Allowed origins are currently empty. Added localhost as default.");
        }
    } catch (err) {
        console.log("Error parsing JSON data while initializing allowedOrigins:", err);
    }
}


async function initializePool() {
    try {
        const contents = await fsPromises.readFile("./src/pool.txt", 'utf-8');
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


async function initializeBin() {
    try {
        const contents = await fsPromises.readFile("./src/deletedBin.txt", 'utf-8');
        if (contents.trim() === "") {
            console.log("The file 'deletedBin.txt' is empty.");
            deletedBin = [];
        } else {
            deletedBin = JSON.parse(contents);
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        deletedBin = [];
    }
}
initializeBin().then(() => {
    console.log("bin initialized")
});
initializePool().then(() => {
    console.log("pool initialized")
});
initializeAllowedOrigins().then(() => {
    console.log("allowed Origins initialized")
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

const mongoURI = "mongodb://localhost:3000/drawing-captcha";

mongoose.connect(mongoURI)
    .then(() => {
        console.log("MongoDB connected");
    }).catch(err => console.error("MongoDB connection error:", err));


const store = new MongoDBSession({
    uri: mongoURI,
    collection: "mySessions",
})

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "nmhSe2OEOadfasd5%%%cVNBYIe7E0h",
    resave: false,
    saveUninitialized: false,
    store: store,
}));

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    }
    else {
        res.redirect("/login")
    }
}

const isHuman = (req, res, next) =>{
    if (req.session.isHuman) {
        next()
    }
    else {
        res.status(403).json({ error: "Invalid request" });    
    }

}

app.get("/", (req, res) => {
    res.render("landing");
});

app.get('/login', generateCSRFToken, (req, res) => {
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken });
});

app.post('/reload', validateCSRFOrExternalKey, (req, res) => {
    if (req.body.session && req.body.session.uniqueFileName) {
        req.session.uniqueFileName = req.body.session.uniqueFileName;
    }
    deleteFile(`./tmpimg/${req.session.uniqueFileName}`);

});

app.get('/getElements', validateCSRFToken, (req, res) => {
    initializePool();
    if (pool) {
        res.json({ pool });
    }
    else console.error("pool not defined");

});

app.put("/crud", validateCSRFToken, (req, res) => {
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
            deletedObject = pool.splice(index, 1)[0];
            console.log("deleted object: ", deletedObject)
            console.log("current pool: ", pool)
            deletedBin.push(deletedObject)

            fs.writeFile('./src/deletedBin.txt', JSON.stringify(deletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });

            fs.writeFile('./src/pool.txt', JSON.stringify(pool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });
            initializePool();
            initializeBin();

        } else {
            pool[index].Name = tmpPool[0].Name
            pool[index].ValidateF = tmpPool[0].ValidateF
            pool[index].validateMinCubes = tmpPool[0].validateMinCubes
            pool[index].validateMaxCubes = tmpPool[0].validateMaxCubes
            pool[index].MaxTolerance = (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length;
            pool[index].MinTolerance = (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length;

            fs.writeFile('./src/pool.txt', JSON.stringify(pool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });

            initializePool();


        }

        initializePool();


        isGood = true;
    } else {
        console.error("Problem with the array")
    }




    res.json({ isGood })


})
app.post("/login", validateCSRFToken, async (req, res) => {
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email });

    if (!user) {
        req.session.message = "Incorrect username or password.";
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        req.session.message = "Incorrect username or password.";
        return res.redirect("/login");
    }

    req.session.user = user;

    req.session.message = "";

    req.session.isAuth = true

    res.redirect("/dashboard")
})

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/dashboard/apiKey", isAuth, validateCSRFToken, (req, res) => {

    res.render("apiKeys", { username: req.session.user.username, email: req.session.user.email });

})

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

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await UserModel.findOne({ email });

        if (user) {
            return res.redirect('register');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user = new UserModel({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.redirect("/login");
    } catch (error) {
        console.error("Error occurred during registration:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/dashboard", isAuth, validateCSRFToken, (req, res) => {
    res.render("dashboard", { username: req.session.user.username, email: req.session.user.email });
})

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

app.post('/getImage', validateCSRFOrExternalKey, async (req, res) => {


    initializePool();

    try {
        if(req.body.session){
            req.session.cookie = req.body.session.cookie;
            req.session.authMethod = req.body.session.authMethod;
            req.session.apiKey = req.body.session.apiKey;
            req.session.clientSpecificData = req.body.session.clientSpecificData;
            req.session.uniqueFileName = req.body.session.uniqueFileName;

        }
        const captchaIdentifier = uuid.v4();
        console.log(captchaIdentifier)

        if (!pool || pool.length === 0) {
            console.error("Pool is empty or not initialized.");
            return res.status(500).json({ error: 'Pool is empty or not initialized.' });
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedContent = pool[randomIndex];

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

        clientData = req.session.clientSpecificData;

        let uniqueFileName;
        let savePath;

        if (client.imgURL) {
            const imageBase64 = client.imgURL;
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            uniqueFileName = generateUniqueName(`${uuid.v4()}.png`);
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

        res.json({ finishedURL, clientData, session: req.session });


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Server request error.' });
    }

});


app.post('/checkCubes', validateCSRFOrExternalKey, async (req, res) => {
    console.log(req.body)
    const selectedFields = req.body.selectedIds;
    const selectedId = req.body.clientData.ID;
    console.log(req.body)

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
        console.log("Deleting: ", req.session.uniqueFileName)
        deleteFile(`./tmpimg/${req.session.uniqueFileName}`)

        res.json({ isValid });
    } else {
        console.log("Deleting: ", req.session.uniqueFileName)
        deleteFile(`./tmpimg/${req.session.uniqueFileName}`)
        res.status(400).json({ error: 'Client data not found' });
    }

    captchaSession.delete(selectedId);
});

app.post('/newValidation', isAuth, validateCSRFToken, (req, res) => {
    const ID = crypto.randomUUID();
    const validateTrueCubes = req.body.validateTrueCubes;
    const validateMinCubes = req.body.validateMinCubes;
    const validateMaxCubes = req.body.validateMaxCubes;
    const componentName = req.body.sessionComponentName;
    const backgroundImage = req.body.backgroundImage;

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
                    "validateMaxCubes": validateMaxCubes
                }
            ];

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
    // store.collection.deleteMany({}, (err) => {
    //     if (err) {
    //         console.error('Fehler beim Löschen der Sessions:', err);
    //     } else {
    //         console.log('Alle Sessions erfolgreich gelöscht.');
    //     }
    // });
});


async function deleteFile(filePath) {
    try {
        const exists = fs.existsSync(filePath);
        if (!exists) {
            console.log(`The file ${filePath} does not exist.`);
            return;
        }

        await fs.unlink(filePath, () => { });
        console.log(`${filePath} successfully deleted!`);
    } catch (err) {
        console.error(`Error deleting file ${filePath}: ${err}`);
    }
}

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

function generateUniqueName(FileName) {
    const timestamp = new Date().getTime();
    const randomValue = crypto.randomBytes(8).toString("hex");
    const fileExtension = FileName.split(".").pop();

    return `${timestamp}-${randomValue}.${fileExtension}`;
}

function generateCSRFToken(req, res, next) {
    if (req.path === '/login') {
        if (!req.session) {
            req.session = {};
        }
        const csrfToken = crypto.randomBytes(16).toString('hex');
        res.cookie('mycsrfToken', csrfToken);
        req.session.csrfToken = csrfToken;

    }
    next();
}

async function doesApiKeyExist(key) {
    let apiKeyExists = await ApiKeyModel.findOne({ apiKey: key })
    return apiKeyExists;
}

function validateCSRFToken(req, res, next) {
    const csrfToken = req.cookies.mycsrfToken;
    if (req.session.csrfToken === csrfToken && req.session.csrfToken != null && csrfToken != null) {
        next();
    } else {
        res.redirect("/");
    }
}

function deleteAndLog() {
    deleteAllFilesInDir("./tmpimg")
        .then(() => console.log("All files deleted in ./tmpimg"))
        .catch(error => console.error("Error deleting files:", error));
}

async function validateCSRFOrExternalKey(req, res, next) {
    let failed = false;
    
    const apiKey = req.body.apiKey;
    let doesExist = await ApiKeyModel.findOne({ apiKey: apiKey });
    
    if (doesExist) {
        req.session.authMethod = "apiKey";
        req.session.apiKey = apiKey;
        
        next();
    } else {
        const CSRFToken = req.cookies.mycsrfToken;
        
        if (req.session.csrfToken === CSRFToken && req.session.csrfToken != null && CSRFToken != null) {
            req.session.authMethod = "csrfToken";
            
            next();
        } else {
            failed = true;
            res.status(403).json({ error: "CSRF Token or API Key validation failed" });
        }
    }
}

