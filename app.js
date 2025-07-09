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
const createModuleLogger = require('./utils/loggerHelper');
const logger = createModuleLogger(__filename);
const { initializeAllowedOrigins, initializeRegisterKey } = require("./controllers/initializeController.js")
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const store = require("./models/store.js")
const csrfMiddleware = require("./middlewares/csurfMiddleware.js")
const port = process.env.PORT;
const hasEnteredRegisterKey = require("./middlewares/hasEnteredRegisterKey.js");
const { authLimiter, tokenLimiter, captchaLimiter, testLimiter, dashboardLimiter, socialAuthLimiter, emailConfirmationLimiter, siteVerifyLimiter } = require("./middlewares/rateLimiter.js")
const initializeAppComposer = require("./controllers/initializeAppComposer.js")
initializeAppComposer()
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use('/tmpimg', express.static('tmpimg'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-src": ["'self'", "https://ajax.googleapis.com", "https://d3e54v103j8qbb.cloudfront.net", "'unsafe-inline'"],
            "style-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://fonts.googleapis.com/css2", "https://fonts.googleapis.com/css", "'unsafe-inline'"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false
}))
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
                logger.warn(`CORS request from disallowed origin: ${origin} form ip: ${req.ip}`,
                    {
                        origin: origin,
                        ip: req.ip,
                        operation: 'cors_check'
                    });
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
        maxAge: 30 * 60 * 1000, 
        secure: process.env.NODE_ENV !== 'DEVELOPMENT',
        httpOnly: true,
        sameSite: 'strict' 
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
app.use('/dashboard', authMiddleware, dashboardLimiter, csrfMiddleware.validateCSRFToken, hasEnteredRegisterKey, dashboardRoutes)
app.use('/user', authMiddleware, dashboardLimiter, csrfMiddleware.validateCSRFToken, hasEnteredRegisterKey, userRoutes)
app.use('/company', authMiddleware, dashboardLimiter, csrfMiddleware.validateCSRFToken, hasEnteredRegisterKey, companyRoutes)
app.use('/registerKey', authMiddleware, dashboardLimiter, csrfMiddleware.validateCSRFToken, registerKeyRoutes)
app.use('/test', testLimiter, testConnectionRoutes)
app.use("/confirm-email", emailConfirmationLimiter, confirmEmail)
app.use("/siteVerify", tokenLimiter, siteVerifyLimiter, csrfMiddleware.validateCSRFOrExternalKey, siteVerifyCallback)

app.use((req, res, next) => {
    if (res.statusCode === 404) {
        return res.redirect('/404');
    }
    next();
});

app.use((err, req, res, next) => {
    const errorDetails = {
        message: err.message || 'No error message provided',
        stack: err.stack || 'No stack trace available',
        name: err.name || 'UnknownError',
        path: req.originalUrl, 
        ip: req.ip, 
        method: req.method,
    };
    
    logger.error(`Unhandled error: ${process.env.NODE_ENV === 'DEVELOPMENT' ? err : err.message}`, errorDetails);
    
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'DEVELOPMENT' ? errorDetails : undefined,
    });
});

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
        await initializeRegisterKey();
    }
    catch (err) {
        logger.error('Error clearing session store:', { error: err.message, stack: err.stack });
    }

})