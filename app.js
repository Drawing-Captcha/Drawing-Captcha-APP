const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require("crypto");
const path = require("path");
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db.js")
const deleteAndLog = require("./services/deleteAndLog.js")
const deleteAllFilesInDir = require("./services/deleteAllFilesInDir.js");
const { pool, deletedBin, allowedOrigins, defaultOrigin, initializeAllowedOrigins, initializeBin, initializePool, initializeRegisterKey} = require("./controllers/initializeController.js")
const createInitCaptcha = require("./config/createInitCaptcha.js")
const generateNewRegisterKey = require("./services/generateRegisterKey.js")
const configInitDomain = require("./config/configInitDomain.js")
const createInitColorKit = require("./config/createInitColorKit.js")
const createDirectory = require("./services/createDirectory.js")
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const store = require("./models/store.js")
const port = process.env.PORT;
let origins
createDirectory()
connectDB()
createInitCaptcha()
createInitColorKit()
configInitDomain()

setInterval(deleteAndLog, 1000 * 60 * 60 * 24);
setInterval(generateNewRegisterKey, 1000 * 60 * 60 * 24);

async function initialize() {
    origins = await initializeAllowedOrigins()
    await pool
    await deletedBin
}

initialize().then(() => {
    console.log("src initialized")
})

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
        if (!origin) {
            return callback(null, true);
        }
        if (origins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 4 * 60 * 60 * 1000
    }
}));


const indexRoutes = require("./routes/index.js")
const authRoutes = require("./routes/auth.js")
const captchaRoutes = require("./routes/captcha.js")
const dashboardRoutes = require("./routes/dashboard.js");
const userRoutes = require("./routes/user.js")
const companyRoutes = require("./routes/company.js")

app.use('/', indexRoutes);
app.use('/auth', authRoutes)
app.use('/captcha', captchaRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/user', userRoutes)
app.use('/company', companyRoutes)

app.listen(port, async () => {
    console.log(`Server Running on port: ${port}`);
    store.collection.deleteMany({}, (err) => {
        if (err) {
            console.error('Error while trying to delete Sessions:', err);
        } else {
            console.log('All Sessions successfully.');
        }
    });
    let message = await initializeRegisterKey();
    console.log(message)
});
