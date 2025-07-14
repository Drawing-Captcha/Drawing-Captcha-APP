const ApiKeyModel = require("../models/ApiKey.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteApiKeyRelation(companyId) {
    try {
        logger.info(`Deleting all Api Keys with company ID ${companyId}`, {
            companyId: companyId,
            operation: 'delete_api_key_relation'
        });
        const apiKeys = await ApiKeyModel.deleteMany({ companies: { $in : companyId } })
        if (!apiKeys) {
            logger.info(`No Api Keys found for company ID ${companyId}.`, {
                companyId: companyId,
                operation: 'delete_api_key_relation'
            });
        }
    } catch (error) {
        logger.error(`An error occurred while deleting Api Keys relations with company ID: ${companyId}`, {
            error: error,
            companyId: companyId,
            operation: 'delete_api_key_relation_error'
        })
    }

}

module.exports = deleteApiKeyRelation;

