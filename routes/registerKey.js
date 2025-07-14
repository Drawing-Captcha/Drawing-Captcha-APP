const express = require('express');
const router = express.Router();
const hasAlreadyEnteredRegisterKeyRedirect = require("../middlewares/hasAlreadyEnteredRegisterKeyRedirect.js");
const registerKeyModel = require("../models/RegisterKey.js");
const userModel = require("../models/User.js");
const sanitize = require('mongo-sanitize');
const isAppAdmin = require("../middlewares/isAppAdmin.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const sanitizeInput = require("../services/sanitizeInput.js");

// file deepcode ignore NoRateLimitingForExpensiveWebOperation: <please specify a reason of ignoring this>
router.get('/', hasAlreadyEnteredRegisterKeyRedirect, (req, res) => {
    try {
        res.render("registerKeyVerification", { error: req.query.error });
    }
    catch (error) {
        console.error("Error occurred during test connection with client:", error);
    }
});

router.post('/', hasAlreadyEnteredRegisterKeyRedirect, async (req, res) => {
    const registerKey = sanitize(req.body.registerKey);
    try {
        const findedRegisterKey = await registerKeyModel.findOne({ RegisterKey: registerKey });
        if (!findedRegisterKey) {
            logger.warn(`Unauthorized attempt to use register key from User ${req.session.user._id}, registerKey: ${registerKey} and AppAdmin: ${req.session.user.appAdmin}`, {
                userId: req.session.user?._id,
                registerKey: registerKey,
                operation: 'use_register_key_unauthorized'
            })
            return res.status(401).redirect("/registerKey?error=Wrong+Register+Key+Please+try+again");
        }
        const user = await userModel.findById(req.session.user._id);
        user.usedRegisterKey = true;
        user.company = findedRegisterKey.Company;
        req.session.user.company = findedRegisterKey.Company;
        await user.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error occurred during verification of register key:", error);
        res.redirect("/registerKey?error=unknownError");
    }
});

router.post('/verify', isAppAdmin, async (req, res) => {
    const userId = sanitizeInput(req.body.userId);
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            logger.warn(`Unauthorized attempt to verify user given: ${userId} and UserID: ${req.session.user._id} from AppAdmin ${req.session.user.appAdmin}`, {
                userId: req.session.user?._id,
                operation: 'verify_user_unauthorized'
            })
            return res.status(404).json({ message: "User not found" });
        }
        if (user.usedRegisterKey) {
            logger.warn(`Unauthorized attempt to verify user given: ${userId} and UserID: ${req.session.user._id} from AppAdmin ${req.session.user.appAdmin}`, {
                userId: req.session.user?._id,
                operation: 'verify_user_unauthorized'
            })
            return res.status(400).json({ message: "User already verified" });
        }
        user.usedRegisterKey = true;
        await user.save();
        return res.status(200).json({ message: `Successfully verified user` });
    } catch (error) {
        console.error("Error occurred during verification of a user through the app admin:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        res.end();
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login")
    })
})

module.exports = router