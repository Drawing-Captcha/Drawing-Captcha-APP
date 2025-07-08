const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function generateRandomRegisterKey(req, res, companyId){
    let message;
    const existingRegisterKey = await registerKeyModel.findOne();

    if (!existingRegisterKey) {
        const newRegisterKey = new registerKeyModel({
            RegisterKey: crypto.randomUUID()
        });

        await newRegisterKey.save();
        message = "New register key successfully generated";
        logger.info(message, { operation: 'update_register_key' });
        return res.status(201).json({ success: true, message, key: newRegisterKey.RegisterKey });
    } else {
        existingRegisterKey.RegisterKey = crypto.randomUUID();
        await existingRegisterKey.save();
        message = "Register key successfully updated";
        logger.info(message, { operation: 'update_register_key' });
        return res.status(200).json({ success: true, message, key: existingRegisterKey.RegisterKey });

    }
}

module.exports = generateRandomRegisterKey;