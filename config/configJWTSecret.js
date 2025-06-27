const appSettingsModel = require("../models/AppSettings.js");
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function configJWTSecret() {
    try {
        const appSettings = await appSettingsModel.findOne({});
        let message;
        if (appSettings) {
            if (appSettings.JWTSecret) {
                message = "JWT Secret already exists in database"
            }
            else {
                appSettings.JWTSecret = crypto.randomUUID();
                await appSettings.save();
                message = "JWT Secret successfully configured"
            }
        }
        else {
            const newAppSettings = new appSettingsModel({
                JWTSecret: crypto.randomUUID()
            });
            await newAppSettings.save();
            message = "JWT Secret successfully configured & created new AppSettings"
        }

        logger.info(message, {
            operation: 'config_jwt_secret'
        });
        return
    }
    catch (err) {
        logger.error("Error configuring JWT Secret: ", {
            error: err,
            operation: 'config_jwt_secret'
        });
        return
    }
}


module.exports = configJWTSecret