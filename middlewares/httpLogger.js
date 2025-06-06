const logger = require('../utils/logger');

/**
 * HTTP request logger middleware
 */
const httpLogger = (req, res, next) => {
    // Get request start time
    const start = Date.now();
    
    // Process the request
    next();
    
    // Log after response is sent
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logContext = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.session?.user?._id || 'not-authenticated'
        };
        
        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logContext);
        } else if (res.statusCode >= 400) {
            logger.warn(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logContext);
        } else {
            logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode}`, logContext);
        }
    });
};

module.exports = httpLogger;

