const express = require("express");
const router = express.Router();
const decodeJWTToken = require("../services/decodeJWTToken.js");
const { sanitizeFilter } = require("mongoose");
const callbackTokenModel = require("../models/CallbackToken.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const JWTExpiration = process.env.JWT_TOKEN_EXPIRATION ?? 5;

router.post("/callback", async (req, res) => {
    try {
        if (!req.body.token) {
            logger.warn("SiteVerifyCallback: No token provided", {
                operation: 'site_verify_callback',
                ip: req.ip
            });
            return res.status(400).json({ isValid: false, message: "No token provided" });
        }
        logger.info(`SiteverifyCallback Received token from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
            operation: 'site_verify_callback',
            ip: req.ip,
            token: req.body.token
        })
        const token = sanitizeFilter(req.body.token);
        const callbackTokenDB = await callbackTokenModel.findOne({ token: token });
        const decodedToken = await decodeJWTToken(token);
        if (!decodedToken) {
            logger.warn(`SiteVerifyCallback Invalid token from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
                operation: 'site_verify_callback',
                ip: req.ip
            })
            return res.status(401).json({ isValid: false, message: "Invalid token" });
        }
        if (Date.now() - decodedToken.issuedAt > JWTExpiration * 60 * 1000) {
            logger.warn(`SiteVerifyCallback Token: ${token} expired from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
                operation: 'site_verify_callback',
                ip: req.ip,
                token: token
            })
            return res.status(400).json({ isValid: false, message: 'Invalid token' });
        }
        if (callbackTokenDB) {
            logger.warn(`SiteVerifyCallback Token: ${token} already used from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
                operation: 'site_verify_callback',
                ip: req.ip,
                token: token
            })
            return res.status(400).json({ isValid: false, message: 'Invalid token' });
        }
        if (!callbackTokenDB) {
            const callbackToken = new callbackTokenModel({ token: token, issuedAt: decodedToken.issuedAt, origin: req.headers.origin });
            await callbackToken.save();
            logger.info(`SiteVerifyCallback Token: ${token} saved from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
                operation: 'site_verify_callback',
                ip: req.ip,
                token: token
            })
        }
        console.log("SiteVerifyCallback: Callback successful");
        res.json({ isValid: true, message: "Callback successful" });
    } catch (error) {
        console.error("SiteVerifyCallback:", error);
        res.status(500).json({ isValid: false, message: "Internal Server Error" });
    }
});

module.exports = router;