const express = require("express");
const helmet = require('helmet')
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
const cleanSessions = require("./crons/cleanSessions.js");
const store = require("./models/store.js")
const rateLimit = require("express-rate-limit");
const port = process.env.PORT;
const expiryDate = new Date(Date.now() + 60 * 60 * 1000)
createDirectory()
connectDB()
createInitCaptcha()
createInitColorKit()
configInitDomain()

setInterval(deleteAndLog, 1000 * 60 * 60 * 24);
setInterval(generateNewRegisterKey, 1000 * 60 * 60 * 24);

setInterval(() => {
    console.log('Running session cleanup...');
    cleanSessions();
}, 60000)


async function initialize() {
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
app.use(helmet())
const csrfProtection = csrf({ cookie: true });

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, 
    message: "Too Many Request's try later again"
});
const captchaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, 
    message: "Too Many Request's try later again"
});
const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150, 
    message: "Too Many Request's try later again"
});

app.use(cors({
    origin: async function (origin, callback) {
        try {
            console.log("origin", origin)
            let origins = await initializeAllowedOrigins();

            if (!origin || origins.includes(origin) || origin === 'null') {
                return callback(null, true);
            }
            if (origins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        } catch (error) {
            console.error('Error fetching allowed origins:', error);
            return callback(new Error('Failed to fetch allowed origins'));
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
        expires: expiryDate,
    }
}));

const indexRoutes = require("./routes/index.js")
const authRoutes = require("./routes/auth.js")
const captchaRoutes = require("./routes/captcha.js")
const dashboardRoutes = require("./routes/dashboard.js");
const userRoutes = require("./routes/user.js")
const companyRoutes = require("./routes/company.js")
const testConnectionRoutes = require("./routes/testConnection.js")

app.use('/', indexRoutes);
app.use('/auth', authLimiter, authRoutes)
app.use('/captcha', captchaLimiter, captchaRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/user', userRoutes)
app.use('/company', companyRoutes)
app.use('/test', testLimiter, testConnectionRoutes)

app.use((req, res, next) => {
    if (!res.headersSent) {
        res.redirect('/404');
    }
});

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

