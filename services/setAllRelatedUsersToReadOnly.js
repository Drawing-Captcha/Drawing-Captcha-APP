const UserModel = require("../models/User.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function setUserRelationToReadOnly(companyId) {
    logger.info(`Setting all users with company ID: ${companyId} to Read Only`, {
        companyId: companyId,
        operation: 'set_user_read_only'
    });

    try {
        const alluser = await UserModel.find({company: companyId})
        const users = await UserModel.updateMany(
            { company: companyId },
            { $set: { role: "read" } }
        );

        logger.info(`Successfully set ${users.nModified} users with company ID: ${companyId} to Read Only`, {
            companyId: companyId,
            userCount: users.nModified,
            operation: 'set_user_read_only_success'
        });

    } catch (error) {
        logger.error(`An error occurred while setting all users with company ID: ${companyId} to Read Only`, error, {
            companyId: companyId,
            operation: 'set_user_read_only_error'
        });
    }
}

module.exports = setUserRelationToReadOnly;

