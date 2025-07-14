const logger = require('./logger');
const path = require('path');

/**
 * Helper function to standardize log formats across the application
 * @param {string} module - The module or file where the log originates
 * @returns {Object} - Logger object with standardized methods
 */
function createModuleLogger(module) {
  // Extract just the filename if a full path is provided
  const moduleName = path.basename(module);

  return {
    info: (message, meta = {}) => {
      logger.info(message, {
        module: moduleName,
        ...meta
      });
    },
    
    warn: (message, meta = {}) => {
      logger.warn(message, {
        module: moduleName,
        ...meta
      });
    },
    
    error: (message, error = null, meta = {}) => {
      const errorData = error ? {
        error: error.message,
        stack: error.stack,
        ...error
      } : {};
      
      logger.error(message, {
        module: moduleName,
        ...errorData,
        ...meta
      });
    },
    
    http: (message, meta = {}) => {
      logger.http(message, {
        module: moduleName,
        ...meta
      });
    },
    
    debug: (message, meta = {}) => {
      logger.debug(message, {
        module: moduleName,
        ...meta
      });
    },
    
    // Helper method to log requests
    request: (req, message, meta = {}) => {
      const reqContext = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip,
        userId: req.session?.user?._id || 'not-authenticated',
        userRole: req.session?.user?.role || 'none'
      };
      
      logger.info(message, {
        module: moduleName,
        request: reqContext,
        ...meta
      });
    }
  };
}

module.exports = createModuleLogger;

