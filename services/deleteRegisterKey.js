const RegisterKeyModel = require("../models/RegisterKey.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteRegisterKey(companyId) {
    try {
        logger.info(`Deleting register key for company ID ${companyId}`, {
            companyId: companyId,
            operation: 'delete_register_key'
        });
        const registerKey = await RegisterKeyModel.findOneAndDelete({ Company: companyId });
        if (!registerKey) {
            logger.info(`No register key found for company ${companyId}`, {
                companyId: companyId,
                operation: 'delete_register_key_not_found'
            });
        }
    } catch (error) {
        logger.error(`Error deleting register key for company ${companyId}:`, error, {
            companyId: companyId,
            operation: 'delete_register_key_error'
        });
    }
}

module.exports = deleteRegisterKey;
