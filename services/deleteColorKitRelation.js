const ColorKitModel = require("../models/ColorKit.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function deleteColorKitRelation(companyId) {
    try {
        logger.info(`Deleting Color Kits for company ID: ${companyId}`, {
            companyId: companyId,
            operation: 'delete_color_kit_relation'
        });
        const colorKits = await ColorKitModel.findOneAndDelete({ company: companyId });
        if (!colorKits) {
            logger.warn(`No Color Kit found for company ID: ${companyId}`, {
                companyId: companyId,
                operation: 'delete_color_kit_not_found'
            });
        }
    } catch (error) {
        logger.error(`An error occurred while deleting Color Kits relations with company ID: ${companyId}`, {
            error: error,
            companyId: companyId,
            operation: 'delete_color_kit_relation_error'
        });
    }
}

module.exports = deleteColorKitRelation;

