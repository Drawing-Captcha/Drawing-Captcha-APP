const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const sanitizeInput = require("../services/sanitizeInput.js");

async function generateRegisterKey(req, res) {
    logger.info(`Generating or updating register key for company ${sanitizeInput(req.body.companyId) || "Unknown"}..`);
    let message;
    let existingRegisterKey;
    try {
        let companyId = sanitizeInput(req.body.companyId);
        if (req.body.isAppKey === true) {
            existingRegisterKey = await registerKeyModel.findOne({ AppKey: true });
        }
        else {
            existingRegisterKey = await registerKeyModel.findOne({ Company: companyId });
        }

        if (!existingRegisterKey) {
            logger.info(`Register key does not exist, generating new one for company ${companyId}...`);
            const newRegisterKey = new registerKeyModel({
                RegisterKey: crypto.randomUUID(),
                Company: companyId,
                AppKey: req.body.isAppKey === true ? true : false
            });

            await newRegisterKey.save();
            message = `New register key successfully generated for company ${companyId}`;;
            logger.info(message, { operation: 'update_register_key' });
            return res.status(201).json({ success: true, message, key: newRegisterKey.RegisterKey });
        } else {
            existingRegisterKey.RegisterKey = crypto.randomUUID();
            existingRegisterKey.AppKey = req.body.isAppKey === true ? true : false;
            existingRegisterKey.Company = companyId;
            await existingRegisterKey.save();
            message = "Register key successfully updated";
            logger.info(message, { operation: 'update_register_key' });
            return res.status(200).json({ success: true, message, key: existingRegisterKey.RegisterKey });
        }
    } catch (error) {
        logger.error("Error occurred during generation of register key:", error);
        message = "Internal server error";
        return res.status(500).json({ success: false, message });
    }
}

module.exports = generateRegisterKey;