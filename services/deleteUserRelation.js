const UserModel = require("../models/User.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteUserRelation(companyId){
    try{
        logger.info(`Deleting user relations with company ID: ${companyId}`, {
            companyId: companyId,
            operation: 'delete_user_relation'
        });
        const users = await UserModel.updateMany({ company: companyId }, { $unset: { company: "" } })

        logger.info(`Successfully deleted ${users.nModified} users with company ID: ${companyId}`, {
            companyId: companyId,
            operation: 'delete_user_relation'
        });

    }catch(error){
        logger.error(`An error occurred while deleting user relations with company ID: ${companyId}`, error, {
            companyId: companyId,
            operation: 'delete_user_relation_error'
        });
    }

}

module.exports = deleteUserRelation;

