const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const authMiddleware = require("../middlewares/authMiddleware.js")
const csrfMiddleware = require("../middlewares/csurfMiddleware.js")
const { authLimiter, tokenLimiter, captchaLimiter, testLimiter, dashboardLimiter, socialAuthLimiter, emailConfirmationLimiter, siteVerifyLimiter } = require("../middlewares/rateLimiter.js")
const hasEnteredRegisterKey = require("../middlewares/hasEnteredRegisterKey.js");

module.exports = (app) => {
    const indexRoutes = require("../routes/index.js")
    const authRoutes = require("../routes/auth.js")
    const captchaRoutes = require("../routes/captcha.js")
    const dashboardRoutes = require("../routes/dashboard.js");
    const userRoutes = require("../routes/user.js")
    const companyRoutes = require("../routes/company.js")
    const testConnectionRoutes = require("../routes/testConnection.js")
    const confirmEmail = require("../routes/confirm-email.js");
    const registerKeyRoutes = require("../routes/registerKey.js")
    const siteVerifyCallback = require("../routes/siteVerifyCallback.js");

    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
        const MicrosoftStrategy = require("../routes/strategies/microsoft.js")
        app.use('/api/auth/microsoft', socialAuthLimiter, MicrosoftStrategy)
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const GoogleStrategy = require("../routes/strategies/google.js")
        app.use('/api/auth/google', socialAuthLimiter, GoogleStrategy)
    }
    app.use('/', indexRoutes);
    app.use('/auth', authLimiter, csrfMiddleware.validateCSRFToken, authRoutes)
    app.use('/captcha', csrfMiddleware.validateCSRFOrExternalKey, captchaLimiter, captchaRoutes)
    app.use('/dashboard', csrfMiddleware.validateCSRFToken, authMiddleware, dashboardLimiter, hasEnteredRegisterKey, dashboardRoutes)
    app.use('/user', csrfMiddleware.validateCSRFToken, authMiddleware, dashboardLimiter, hasEnteredRegisterKey, userRoutes)
    app.use('/company', csrfMiddleware.validateCSRFToken, authMiddleware, dashboardLimiter, hasEnteredRegisterKey, companyRoutes)
    app.use('/registerKey', csrfMiddleware.validateCSRFToken, authMiddleware, dashboardLimiter, registerKeyRoutes)
    app.use('/test', testLimiter, testConnectionRoutes)
    app.use("/confirm-email", emailConfirmationLimiter, confirmEmail)
    app.use("/siteVerify", siteVerifyLimiter, csrfMiddleware.validateCSRFOrExternalKey, siteVerifyCallback)

    app.use((req, res, next) => {
        res.status(404).redirect('/404');
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
}