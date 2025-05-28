const AppSettingsModel = require("../models/AppSettings.js");
const jwt = require('jsonwebtoken');

async function decodeJWTToken(token) {
    try {
        const AppSettings = await AppSettingsModel.findOne({ JWTSecret: { $exists: true } });
        if (!AppSettings || !AppSettings.JWTSecret) {
            throw new Error('JWT Secret not found in database.');
        }
        const secretKey = AppSettings.JWTSecret;
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token:', error);
    }
}

module.exports = decodeJWTToken;
