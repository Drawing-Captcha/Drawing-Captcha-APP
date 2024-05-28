const ApiKeyModel = require("../models/ApiKey.js")
const crypto = require("crypto");

const generateCSRFToken = (req, res, next) => {
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

const validateCSRFToken = (req, res, next) => {
    const csrfToken = req.cookies.mycsrfToken;
    if (req.session.csrfToken === csrfToken && req.session.csrfToken != null && csrfToken != null) {
        next();
    } else {
        res.redirect("/");
    }
}

const validateCSRFOrExternalKey = async (req, res, next) => {
    let failed = false;

    const apiKey = req.body.apiKey;
    try {
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
    } catch (error) {
        console.error('Error during API key validation:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    generateCSRFToken,
    validateCSRFToken,
    validateCSRFOrExternalKey
}