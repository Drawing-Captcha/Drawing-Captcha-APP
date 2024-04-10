const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const UserModel = require("./models/user.js");
const bcrypt = require("bcryptjs")
const { promises: fsPromises } = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 90;
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const uuid = require('uuid');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

setInterval(deleteAndLog, 1000 * 60 * 60 * 24);

let pool;
const captchaSession = new Map();


async function initializePool() {
    try {
        const contents = await fsPromises.readFile("./src/pool.txt", 'utf-8');
        pool = JSON.parse(contents);
    } catch (err) {
        console.log(err);
        pool = [];
    }
}
initializePool().then(() => {
    console.log("pool initialized")
});

const app = express();
deleteAllFilesInDir("./tmpimg").then(console.log("All files deleted in ./tmpimg"))
app.use(express.static("public"));
app.use('/tmpimg', express.static('tmpimg'));
app.use(bodyParser.json());
app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });


const mongoURI = "mongodb://localhost:3000/sessions"

mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB connected");
}).catch(err => console.error("MongoDB connection error:", err));


const store = new MongoDBSession ({
    uri: mongoURI,
    collection: "mySessions",
})

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true}));

app.use(session({
    secret: "nmhSe2OEOcVNBYIe7E0h",
    resave: false,
    saveUninitialized: false,
    store: store, 
}));


const isAuth = (req, res, next) => {
    if(req.session.isAuth){
        next()
    }
    else{
        res.redirect("/login")
    }
}

app.get("/", (req, res) => {
    res.render("landing");
}); 

app.get('/login', generateCSRFToken, (req, res) => {
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken  });
});

app.post('/reload', generateCSRFToken, (req, res) => {
    deleteFile(`./tmpimg/${req.session.uniqueFileName}`);
});

app.get('/getElements', validateCSRFToken, (req, res) => {
    initializePool();
    if (pool) {
        res.json({ pool });
    }
    else ("pool nicht definiert")

});

app.post("/login", validateCSRFToken, async (req, res) =>{
    const {email, password} = req.body;
    let user = await UserModel.findOne({email});

    if(!user){
        req.session.message = "Benutzername oder Passwort falsch.";
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        req.session.message = "Benutzername oder Passwort falsch.";
        return res.redirect("/login");
    }
    req.session.message = "";
    
    req.session.isAuth = true

    res.redirect("/dashboard")
})

app.get("/register", (req, res) => {
    res.render("register");
}); 
app.post("/register", async (req, res) =>{
    const {username, email, password} = req.body;
    let user = await UserModel.findOne({email})

    if(user){
        return res.redirect('register');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user = new UserModel({
        username,
        email,
        password: hashedPassword
    })
    
    await user.save();

    res.redirect("/login");

});

app.get("/dashboard", isAuth, (req, res) => { 
    res.render("dashboard");
})

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if(err) throw err;
        res.redirect("/")
    })
}) 

app.get('/getImage', validateCSRFToken, (req, res) => {

    initializePool();

    try {
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
                    console.error(`Fehler beim Speichern der Datei: ${err}`);
                    return res.status(500).json({ error: 'Fehler beim Speichern der Datei.' });
                } else {
                    console.log(`Datei erfolgreich gespeichert unter: ${savePath}`);
                }
            });
        } else {
            console.error("client.imgURL is undefined");
            return res.status(500).json({ error: 'client.imgURL is undefined.' });
        }

        const finishedURL = `/tmpimg/${uniqueFileName}`;

        res.json({ finishedURL, clientData });


    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Fehler bei der Serveranfrage.' });
    }


});

app.post('/checkCubes', (req, res) => {
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
        res.status(400).json({ error: 'Client-Daten nicht gefunden' });
    }

    captchaSession.delete(selectedId);
});

app.listen(port, () => {
    console.log(`Server Running on http://localhost:${port}/`);
});


async function deleteFile(filePath) {
    try {
        const exists = fs.existsSync(filePath);
        if (!exists) {
            console.log(`Die Datei ${filePath} existiert nicht.`);
            return;
        }
      
        await fs.unlink(filePath, () => {});
        console.log(`${filePath} erfolgreich gelöscht!`);
    } catch (err) {
        console.error(`Fehler beim Löschen der Datei ${filePath}: ${err}`);
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

