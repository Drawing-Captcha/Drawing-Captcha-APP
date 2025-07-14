const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteDeletedCaptchaModel(companyId) {
    logger.info(`Deleting (DeletedArchive) Captcha relations with company ID: ${companyId}`, {
        companyId: companyId,
        operation: 'delete_deletedarchive_captcha_start'
    });
    try {
        const captchas = await DeletedCaptchaModel.find({ companies: companyId });

        logger.info(`Found ${captchas.length} (DeletedArchive) Captchas with company ID: ${companyId}`, {
            companyId: companyId,
            count: captchas.length,
            operation: 'delete_deletedarchive_captcha_found'
        });
        captchas.forEach(captcha => {
            if (captcha.companies.includes(companyId)) {
                logger.info(`Removing company ID: ${companyId} from (DeletedArchive) Captcha ID: ${captcha.ID}`, {
                    companyId: companyId,
                    captchaId: captcha.ID,
                    operation: 'delete_deletedarchive_captcha_remove'
                });
                captcha.companies.splice(captcha.companies.indexOf(companyId), 1);
                captcha.save();
            }
        });

    } catch (error) {
        logger.error(`An error occurred while deleting (DeletedArchive) Captcha relations with company ID: ${companyId}`, error, {
            companyId: companyId,
            operation: 'delete_deletedarchive_captcha_error'
        });
    }

}

module.exports = deleteDeletedCaptchaModel;
