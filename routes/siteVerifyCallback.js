const express = require("express");
const router = express.Router();
const decodeJWTToken = require("../services/decodeJWTToken.js");
const { sanitizeFilter } = require("mongoose");
const callbackTokenModel = require("../models/CallbackToken.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

router.post("/callback", async (req, res) => {
    try {
        if (!req.body.token) {
            console.warn("SiteVerifyCallback: No token provided");
            return res.status(400).json({ isValid: false, message: "No token provided" });
        }
        console.log("SiteVerifyCallback: Received callback request with token: ", req.body.token, " and origin: ", req.headers.origin);
        const token = sanitizeFilter(req.body.token);
        const callbackTokenDB = await callbackTokenModel.findOne({ token: token });
        const decodedToken = await decodeJWTToken(token);
        if (!decodedToken) {
            console.warn("SiteVerifyCallback: Invalid token");
            return res.status(401).json({ isValid: false, message: "Invalid token" });
        }
        if (Date.now() - decodedToken.issuedAt > process.env.JWT_TOKEN_EXPIRATION * 60 * 1000) {
            console.warn("SiteVerifyCallback: Token deprecated");
            return res.status(400).json({ isValid: false, message: 'Invalid token' });
        }
        if (callbackTokenDB) {
            console.warn("SiteVerifyCallback: Token already used");
            return res.status(400).json({ isValid: false, message: 'Invalid token' });
        }
        if (!callbackTokenDB) {
            const callbackToken = new callbackTokenModel({ token: token, issuedAt: decodedToken.issuedAt, origin: req.headers.origin });
            await callbackToken.save();
            console.log("SiteVerifyCallback: Token saved to database");
        }
        console.log("SiteVerifyCallback: Callback successful");
        res.json({ isValid: true, message: "Callback successful" });
    } catch (error) {
        console.error("SiteVerifyCallback:", error);
        res.status(500).json({ isValid: false, message: "Internal Server Error" });
    }
});

module.exports = router;