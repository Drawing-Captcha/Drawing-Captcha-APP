const appSettingsModel = require("../models/AppSettings.js");
const jwt = require("jsonwebtoken");
const generatePassCode = require("../services/generatePassCode.js");

async function generateJWTToken() {
    try {
        const AppSettings = await appSettingsModel.findOne({ JWTSecret: { $exists: true } });
        const randomPasscode = generatePassCode();
        if (!AppSettings.JWTSecret) {
            throw new Error('JWT Secret not found in database.');
        }
        const token = jwt.sign(
            {
                passcode: randomPasscode,
                issuedAt: Date.now(),
            },
            AppSettings.JWTSecret,
            { expiresIn: '5m' }
        );

        return token;
    }
    catch (error) {
        console.error("Error generating JWT token:", error);
        throw error;
    }
}

module.exports = generateJWTToken;


