const express = require("express");
const helmet = require('helmet')
const session = require("express-session");
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require("crypto");
const path = require("path");
const authMiddleware = require("./middlewares/authMiddleware.js")
const csrf = require('csurf');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db.js")
const deleteAndLog = require("./services/deleteAndLog.js")
const logger = require('./utils/logger');
const deleteAllFilesInDir = require("./services/deleteAllFilesInDir.js");
const { pool, deletedBin, initializeAllowedOrigins, initializeRegisterKey } = require("./controllers/initializeController.js")
const createInitCaptcha = require("./config/createInitCaptcha.js")
const generateNewRegisterKey = require("./services/generateRegisterKey.js")
const configInitDomain = require("./config/configInitDomain.js")
const createInitColorKit = require("./config/createInitColorKit.js")
const createDirectory = require("./services/createDirectory.js")
const configureJWTSecret = require("./config/configJWTSecret.js")
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const cleanSessions = require("./crons/cleanSessions.js");
const store = require("./models/store.js")
const csrfMiddleware = require("./middlewares/csurfMiddleware.js")
const rateLimit = require("express-rate-limit");
const port = process.env.PORT;
const hasEnteredRegisterKey = require("./middlewares/hasEnteredRegisterKey.js");
const cleanTokens = require("./crons/cleanTokens.js");
createDirectory()
connectDB()
createInitCaptcha()
createInitColorKit()
configInitDomain()
configureJWTSecret()

setInterval(deleteAndLog, 1000 * 60 * 60 * 24);
setInterval(generateNewRegisterKey, 1000 * 60 * 60 * 24);
setInterval(() => {
    logger.info('Running session cleanup...');
    cleanSessions();
}, 1000 * 60 * 60)
setInterval(() => {
    logger.info('Running token cleanup...');
    cleanTokens();
}, 1000 * 60 * 5);


async function initialize() {
    await pool
    await deletedBin
}

initialize().then(() => {
    logger.info("src initialized")
})

const app = express();
deleteAllFilesInDir("./tmpimg").then(() => logger.info("All files deleted in ./tmpimg"))

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    logger.info('Created logs directory');
}

// Add HTTP request logging middleware
const httpLogger = require('./middlewares/httpLogger');
app.use(httpLogger);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use('/tmpimg', express.static('tmpimg'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false
}))
const csrfProtection = csrf({ cookie: true });

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    message: "Too Many Request's try later again",
    delayMs: 1000
});
const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too Many Request's try later again"
});
const captchaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again"
});
const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again"
});
const dashboardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again",
    delayMs: 2000,
    headers: true
});
const socialAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 30, 
    message: "Too many Auths Sign-In requests from this IP, please try again after an hour."
});

app.use(cors({
    origin: async function (origin, callback) {
        try {
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
            logger.error('Error fetching allowed origins:', { error: error.message, stack: error.stack });
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
        maxAge: 4 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize())
app.use(passport.session())
const indexRoutes = require("./routes/index.js")
const authRoutes = require("./routes/auth.js")
const captchaRoutes = require("./routes/captcha.js")
const dashboardRoutes = require("./routes/dashboard.js");
const userRoutes = require("./routes/user.js")
const companyRoutes = require("./routes/company.js")
const testConnectionRoutes = require("./routes/testConnection.js")
const confirmEmail = require("./routes/confirm-email.js");
const registerKeyRoutes = require("./routes/registerKey.js")
const siteVerifyCallback = require("./routes/siteVerifyCallback.js");
const { error } = require("console");

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    const MicrosoftStrategy = require("./routes/strategies/microsoft.js")
    app.use('/api/auth/microsoft', socialAuthLimiter, MicrosoftStrategy)
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require("./routes/strategies/google.js")
    app.use('/api/auth/google', socialAuthLimiter, GoogleStrategy)
}
app.use('/', indexRoutes);
app.use('/auth', authLimiter, authRoutes)
app.use('/captcha', captchaLimiter, csrfMiddleware.validateCSRFOrExternalKey, captchaRoutes)
app.use('/dashboard', authMiddleware, csrfMiddleware.validateCSRFToken ,hasEnteredRegisterKey, dashboardLimiter, dashboardRoutes)
app.use('/user', authMiddleware, csrfMiddleware.validateCSRFToken, hasEnteredRegisterKey, dashboardLimiter, userRoutes)
app.use('/company', authMiddleware, csrfMiddleware.validateCSRFToken, hasEnteredRegisterKey, dashboardLimiter, companyRoutes)
app.use('/registerKey', authMiddleware, csrfMiddleware.validateCSRFToken, dashboardLimiter ,registerKeyRoutes)
app.use('/test', testLimiter, testConnectionRoutes)
app.use("/confirm-email", confirmEmail)
app.use("/siteVerify", tokenLimiter, csrfMiddleware.validateCSRFOrExternalKey ,siteVerifyCallback)

app.use((req, res, next) => {
    if (!res.headersSent) {
        res.redirect('/404');
    }
});

app.use((err, req, res, next) => {
    logger.error('Unhandled error:', { 
        error: err.message, 
        stack: err.stack,
        path: req.originalUrl,
        ip: req.ip,
        method: req.method,
        requestId: req.id
    });
    res.status(500).json({
        message: 'Internal Server Error',
        error: 'An unexpected error occurred'
    });
})

app.listen(port, async () => {
    try {
        logger.info(`Server Running on port: ${port}`);
        store.collection.deleteMany({}, (err) => {
            if (err) {
                logger.error('Error while trying to delete Sessions:', { error: err.message, stack: err.stack });
            } else {
                logger.info('All Sessions cleared successfully.');
            }
        });
        let message = await initializeRegisterKey();
        logger.info(message);
    }
    catch (err) {
        logger.error('Error clearing session store:', { error: err.message, stack: err.stack });
    }

})
