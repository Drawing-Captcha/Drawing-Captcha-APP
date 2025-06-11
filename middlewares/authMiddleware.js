const sanitizeInput = require('../services/sanitizeInput');
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        logger.warn(`is authenticated failed`, {
            session: req.session,
            url: req.originalUrl,
            method: req.method,
            userAgent: req.get('User-Agent')
        });
        res.status(302).redirect("/login");
    }
};

module.exports = isAuth;
