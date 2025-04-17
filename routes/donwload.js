const express = require('express');
const router = express.Router();
const CaptchaModel = require("../models/Captcha.js");
const sanitize = require('mongo-sanitize');

router.post('/captcha', (req, res) => {
    try {
        console.log("download");

        const { _id } = req.body;
        const sanitizedId = sanitize(_id);
        const captcha = CaptchaModel.findById(sanitizedId);
        if (!captcha.companies.includes(req.session.user.company) && !req.session.user.appAdmin && !req.session.user.initialCaptcha) {
            if (!captcha) {
                return res.status(404).json({ message: "Captcha not found" });
            }
        }
        else {
            if (req.session.user.role === "admin" || req.session.user.role === "readWrite" || req.session.user.appAdmin || req.session.user.initialCaptcha) {
                res.setHeader('Content-Disposition', `attachment; filename=${captcha.Name}.json`);
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).send(JSON.stringify(captcha, null, 2));
            }
        }
    }
    catch (error) {
        console.error("Error occurred during test connection with client:", error);
    }
});


module.exports = router