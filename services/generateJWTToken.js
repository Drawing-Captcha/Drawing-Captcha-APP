const appSettingsModel = require("../models/AppSettings.js");
const jwt = require("jsonwebtoken");
const generatePassCode = require("../services/generatePassCode.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const JWTExpiration = process.env.JWT_TOKEN_EXPIRATION ?? 5;

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
            { expiresIn: `${JWTExpiration}m` }
        );

        return token;
    }
    catch (error) {
        console.error("Error generating JWT token:", error);
        throw error;
    }
}

module.exports = generateJWTToken;


