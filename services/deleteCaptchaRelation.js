const CaptchaModel = require("../models/Captcha.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function deleteCaptchaRelation(companyId) {
    logger.info(`Deleting Captcha relations with company ID: ${companyId}`, {
        companyId: companyId,
        operation: 'delete_captcha_start'
    });
    try {
        const captchas = await CaptchaModel.find({ companies: companyId });

        logger.info(`Found ${captchas.length} Captchas with company ID: ${companyId}`, {
            companyId: companyId,
            count: captchas.length,
            operation: 'delete_captcha_found'
        });
        captchas.forEach(captcha => {
            if (captcha.companies.includes(companyId)) {
                logger.info(`Removing company ID: ${companyId} from Captcha ID: ${captcha.ID}`, {
                    companyId: companyId,
                    captchaId: captcha.ID,
                    operation: 'delete_captcha_remove'
                });
                captcha.companies.splice(captcha.companies.indexOf(companyId), 1);
                captcha.save();
            }
        });

    } catch (error) {
        logger.error(`An error occurred while deleting Captcha relations with company ID: ${companyId}`, error, {
            companyId: companyId,
            operation: 'delete_captcha_error'
        });
    }
}

module.exports = deleteCaptchaRelation;
