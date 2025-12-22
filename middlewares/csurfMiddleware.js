const ApiKeyModel = require("../models/ApiKey.js");
const OriginModel = require("../models/AllowedOrigins.js");
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

const generateCSRFToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        if (req.path === '/login' || req.path === '/register') {
            const csrfToken = crypto.randomBytes(16).toString('hex');
            req.session.csrfToken = csrfToken;
            res.cookie('mycsrfToken', csrfToken, { httpOnly: true, secure: true });
            logger.info(`CSRF Token generated for path: ${req.path} and IP: ${req.ip}`, {
                operation: 'generate_csrf_token',
                path: req.path,
                tokenPrefix: csrfToken.substring(0, 8) + '...' // Only log token prefix for security
            });

        }
    }
    next();
};

const validateCSRFToken = (req, res, next) => {
    const csrfToken = req.cookies.mycsrfToken;
    if (req.session.csrfToken === csrfToken && req.session.csrfToken != null && csrfToken != null) {
        logger.info(`CSRF token validated for path: ${req.path} and IP: ${req.ip}`, {
            operation: 'validate_csrf_token',
            path: req.path
            // Token not logged for security
        });
        next();
    } else {
        logger.warn(`CSRF token validation failed for path: ${req.path} and IP: ${req.ip}`, {
            operation: 'validate_csrf_token',
            path: req.path
            // Token not logged for security
        });
        res.redirect("/login");
    }
};

const validateCSRFOrExternalKey = async (req, res, next) => {
    try {
        const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
        const apiKey = req.body.apiKey;

        if (!apiKey || !uuidRegex.test(apiKey)) {
            logger.warn(`Invalid API key format from IP: ${req.ip} and path: ${req.path}`, {
                operation: 'validate_api_key',
                apiKeyProvided: !!apiKey,
                ip: req.ip
            })
            return res.status(400).json({ error: "Invalid API key" });
        }

        const doesExist = await ApiKeyModel.findOne({ apiKey: { $eq: apiKey } });

        if (doesExist) {
            const originRelation = await OriginModel.find({
                companies: { $in: doesExist.companies },
                allowedOrigin: req.headers.origin
            });

            if (originRelation.length === 0) {
                logger.warn(`Origin not allowed for provided apiKey from IP: ${req.ip} and path: ${req.path}`, {
                    apiKeyPrefix: apiKey.substring(0, 8) + '...', // Only log prefix for security
                    origin: req.headers.origin,
                    operation: 'validate_api_key'
                })
                return res.status(403).json({ error: "Origin not allowed, with this apiKey" });
            }

            req.session.authMethod = "apiKey";
            req.session.apiKey = apiKey;

            logger.info(`API key validated for path: ${req.path} and IP: ${req.ip}`,{
                operation: 'validate_api_key',
                path: req.path,
                apiKeyPrefix: apiKey.substring(0, 8) + '...' // Only log prefix for security
            })
            next();
        } else {
            const CSRFToken = req.cookies.mycsrfToken;

            if (req.session.csrfToken === CSRFToken && req.session.csrfToken != null && CSRFToken != null) {
                req.session.authMethod = "csrfToken";

                logger.info(`CSRF token validated for path: ${req.path} and IP: ${req.ip}`,{
                    operation: 'validate_csrf_or_external_key',
                    path: req.path
                    // Token not logged for security
                });
                next();
            } else {
                logger.warn(`CSRF Token or API Key validation failed for path: ${req.path} and IP: ${req.ip}`,{
                    operation: 'validate_csrf_or_external_key',
                    path: req.path
                    // Token not logged for security
                });
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
