const ApiKeyModel = require("../models/ApiKey.js");
const OriginModel = require("../models/AllowedOrigins.js");
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

const generateCSRFToken = (req, res, next) => {
    if (!req.session) {
        req.session = {};
    }

    if (!req.session.csrfToken) {
        if (req.path === '/login' || req.path === '/register') {
            const csrfToken = crypto.randomBytes(16).toString('hex');
            res.cookie('mycsrfToken', csrfToken, { httpOnly: true, secure: true });
            req.session.csrfToken = csrfToken;

            logger.info({
                csrfToken: csrfToken,
                path: req.path
            }, "CSRF token generated and stored in session");
        }
    }
    next();
};

const validateCSRFToken = (req, res, next) => {
    const csrfToken = req.cookies.mycsrfToken;

    if (req.session.csrfToken === csrfToken && req.session.csrfToken != null && csrfToken != null) {
        logger.info({
            csrfToken: csrfToken,
            operation: 'validate_csrf_token'
        }, "CSRF token validation successful");
        next();
    } else {
        logger.warn({
            sessionCSRFToken: req.session.csrfToken,
            csrfToken: csrfToken,
            operation: 'validate_csrf_token'
        }, "CSRF token validation failed");
        res.redirect("/login");
    }
};

const validateCSRFOrExternalKey = async (req, res, next) => {
    try {
        console
        const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
        const apiKey = req.body.apiKey;

        if (!apiKey || !uuidRegex.test(apiKey)) {
            logger.warn({
                apiKey: apiKey,
                operation: 'validate_api_key'
            }, "Invalid or missing API key");
        }

        const doesExist = await ApiKeyModel.findOne({ apiKey: apiKey });

        if (doesExist) {
            const originRelation = await OriginModel.find({
                companies: { $in: doesExist.companies },
                allowedOrigin: req.headers.origin
            });

            if (originRelation.length === 0) {
                logger.warn({
                    apiKey: apiKey,
                    origin: req.headers.origin,
                    operation: 'validate_api_key'
                }, "Origin not allowed for this API key");
                return res.status(403).json({ error: "Origin not allowed, with this apiKey" });
            }

            req.session.authMethod = "apiKey";
            req.session.apiKey = apiKey;

            logger.info({
                apiKey: apiKey,
                origin: req.headers.origin,
                operation: 'validate_api_key'
            }, "API key validation successful");
            console.log("validated api key")
            next();
        } else {
            const CSRFToken = req.cookies.mycsrfToken;

            if (req.session.csrfToken === CSRFToken && req.session.csrfToken != null && CSRFToken != null) {
                req.session.authMethod = "csrfToken";

                logger.info({
                    csrfToken: CSRFToken,
                    operation: 'validate_csrf_token'
                }, "CSRF token validation successful as fallback");
                next();
            } else {
                logger.warn({
                    sessionCSRFToken: req.session.csrfToken,
                    csrfToken: CSRFToken,
                    operation: 'validate_csrf_or_external_key'
                }, "CSRF token and API key validation both failed");
                res.status(403).json({ error: "CSRF Token or API Key validation failed" });
            }
        }
    } catch (error) {
        logger.error({
            error: error.message,
            stack: error.stack,
            operation: 'validate_api_key'
        }, "Error during API key validation");
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    generateCSRFToken,
    validateCSRFToken,
    validateCSRFOrExternalKey
};
