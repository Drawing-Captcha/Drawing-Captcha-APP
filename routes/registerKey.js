const express = require('express');
const router = express.Router();
const hasAlreadyEnteredRegisterKeyRedirect = require("../middlewares/hasAlreadyEnteredRegisterKeyRedirect.js");
const registerKeyModel = require("../models/RegisterKey.js");
const userModel = require("../models/User.js");
const sanitize = require('mongo-sanitize');
const isAppAdmin = require("../middlewares/isAppAdmin.js");

router.get('/', hasAlreadyEnteredRegisterKeyRedirect, (req, res) => {
    try{
        res.render("registerKeyVerification", { error: req.query.error });
    }
    catch(error){
        console.error("Error occurred during test connection with client:", error);
    }
});

router.post('/', hasAlreadyEnteredRegisterKeyRedirect, async (req, res) => {
    const registerKey = sanitize(req.body.registerKey);
    try {
        const findedRegisterKey = await registerKeyModel.findOne({ RegisterKey: registerKey });
        if (!findedRegisterKey) {
            return res.redirect("/registerKey?error=invalidKey");
        }
        const user = await userModel.findById(req.session.user._id);
        user.usedRegisterKey = true;
        await user.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Error occurred during verification of register key:", error);
        res.redirect("/registerKey?error=unknownError");
    }
});

router.post('/verify', isAppAdmin, hasAlreadyEnteredRegisterKeyRedirect, async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.sendStatus(404).json({ error: "User not found" });
        }
        user.usedRegisterKey = true;
        await user.save();
        return res.sendStatus(200).json({ message: "User verified successfully" });
    } catch (error) {
        console.error("Error occurred during verification of a user through the app admin:", error);
        return res.sendStatus(500).json({ error: "Internal server error" });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/login")
    })
})

module.exports = router