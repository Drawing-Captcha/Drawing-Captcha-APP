const AllowedOriginModel = require("../models/AllowedOrigins.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteAllowedOriginRelation(companyId) {
    try {
        logger.info(`Deleting allowed origins for company ID ${companyId}`, {
            companyId: companyId,
            operation: 'delete_allowed_origin_relation'
        });
        const allowedOrigins = await AllowedOriginModel.deleteMany({ companies: { $in : companyId } })
        if (!allowedOrigins) {
            logger.info(`No allowed origin found for company ID ${companyId}.`, {
                companyId: companyId,
                operation: 'delete_allowed_origin_relation'
            });
        }
    } catch (error) {
        logger.error(`An error occurred while deleting allowed Origins relations with company ID: ${companyId}`, {
            error: error,
            companyId: companyId,
            operation: 'delete_allowed_origin_relation_error'
        })
    }

}

module.exports = deleteAllowedOriginRelation;
