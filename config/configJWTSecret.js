const appSettingsModel = require("../models/AppSettings.js");
const crypto = require("crypto");
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

        console.log(message);
        return
    }
    catch (err) {
        console.log("Error configuring JWT Secret: ", err);
        return
    }
}


module.exports = configJWTSecret