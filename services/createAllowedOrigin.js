const AllowedOriginModel = require("../models/AllowedOrigins.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function createAllowedOrigin(companyId, origin) {
    try {
        logger.info(`Trying to create a new allowed origin: ${origin} for company: ${companyId}`, {
            companyId: companyId,
            origin: origin,
            operation: 'create_allowed_origin'
        });
        const newOrigin = new AllowedOriginModel({
            allowedOrigin: origin,
            companies: [companyId],
            initOrigin: false
        });
        const result = await newOrigin.save();
        logger.info(`Successfully created a new allowed origin: ${result.allowedOrigin} for company: ${result.companies[0]}`, {
            companyId: result.companies[0],
            origin: result.allowedOrigin,
            operation: 'create_allowed_origin_success'
        });
    } catch (error) {
        logger.error(`Error occurred while creating a new allowed origin: ${error.message}`, {
            error: error,
            companyId: companyId,
            origin: origin,
            operation: 'create_allowed_origin_error'
        });
    }
}

module.exports = createAllowedOrigin;

