const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const sendEmail = require('../services/sendEmail.js');
const generateEmailConfirmationToken = require("../services/generateEmailConfirmationToken.js");
const emailService = process.env.EMAIL_SERVICE;
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const sanitizeInput = require('../services/sanitizeInput.js');
const isValidEmail = require('../services/isValidEmail.js');
const xss = require('xss');

// file deepcode ignore NoRateLimitingForExpensiveWebOperation: <is being handled by the emailConfirmationLimiter middleware in app.js>
router.get('/', async (req, res) => {
    let { token } = req.query;
    token = sanitizeInput(token);
    try {
        const user = await User.findOne({ emailConfirmationToken: token });
        if (user && !user.isEmailConfirmed) {
            user.isEmailConfirmed = true;
            user.emailConfirmationToken = undefined;
            await user.save();
            res.render("emailVerified", { verified: "Email successfully verified! You will be redirected to the login page in 5 seconds." });
        } else {
            res.render("emailVerified", { verified: "Invalid or expired confirmation link. You will be redirected to the login page in 5 seconds." });
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred while verifying your email. Please try again later.");
    }
});

router.post('/', csrfMiddleware.validateCSRFToken, async (req, res) => {
    let email = sanitizeInput(req.body.email);
    try {
        if (isValidEmail(email) === false) {
            req.session.ResendMailMessage = "Invalid email address.";
            req.session.isSuccessfullResending = false;
            return res.status(400).redirect("/resendEmailVerification");
        }
        const user = await User.findOne({ email });
        if (!user) {
            req.session.ResendMailMessage = "No user with this email address found.";
            req.session.isSuccessfullResending = false;
            return res.status(400).redirect("/resendEmailVerification");
        }
        if (user.isEmailConfirmed) {
            req.session.ResendMailMessage = "Email is already confirmed.";
            req.session.isSuccessfullResending = false;
            return res.status(400).redirect("/resendEmailVerification");
        }
        const token = generateEmailConfirmationToken();
        const host = xss(req.headers.host);
        const confirmationLink = `http://${host}/confirm-email?token=${token}`;
        let emailConfirmationToken = token;

        let subject = 'Drawing-Captcha | Email Confirmation';
        let text = `Please click the following link to confirm your email address: ${confirmationLink}`;
        let html = `<div style="width: 100%; height: fit-content; display: flex; align-items: center; justify-content: center;"><img src="https://docs.drawing-captcha.com/media/3yih32u5/drawing-captcha_small.png?width=240&v=1db77deb55dccb0" style="width: 100px; height: 100px;"></div><h1>Confirm your Email for ${host} Drawing Captcha App</h1><p>Please click the following link to confirm your email address: <a href="${confirmationLink}">Confirm Email here</a></p>`;

        await sendEmail(subject, text, html, email);
        user.emailConfirmationToken = emailConfirmationToken;
        req.session.ResendMailMessage = "Email verification link has been sent to your email.";
        req.session.isSuccessfullResending = true;
        await user.save();
        res.status(200).redirect("/resendEmailVerification");

    } catch (error) {
        console.error(error);
        res.send("An error occurred while resending verification email. Please try again later.");
    }
});

module.exports = router;



