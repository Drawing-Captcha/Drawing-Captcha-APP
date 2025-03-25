const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const sendEmail = require('../services/sendEmail.js');
const generateEmailConfirmationToken = require("../services/generateEmailConfirmationToken.js");
const emailUser = process.env.DEFAULT_EMAIL_USER;
const emailPass = process.env.DEFAULT_EMAIL_PASS;
const csrfMiddleware = require("../middlewares/csurfMiddleware");
router.get('/', async (req, res) => {
    const { token } = req.query;

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
    const { email } = req.body;
    try {
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
        const confirmationLink = `http://${req.headers.host}/confirm-email?token=${token}`;
        let emailConfirmationToken = token;
        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Drawing-Captcha | Email Confirmation',
            text: `Please click the following link to confirm your email address: ${confirmationLink}`,
            html: `<div style="width: 100%; height: fit-content; display: flex; align-items: center; justify-content: center;"><img src="https://docs.drawing-captcha.com/media/3yih32u5/drawing-captcha_small.png?width=240&v=1db77deb55dccb0" styles="width: 100px; height: 100px;"></div><h1>Confirm your Email for ${req.headers.host} Drawing Captcha App</h1><p>Please click the following link to confirm your email address: <a href="${confirmationLink}">Confirm Email here</a></p>`,
        };

        await sendEmail(mailOptions);
        user.emailConfirmationToken = emailConfirmationToken;
        req.session.ResendMailMessage = "Email verification link has been sent to your email.";
        req.session.isSuccessfullResending = true;
        await user.save();
        res.status(200).redirect("/resendEmailVerification");

    } catch (error) {
        console.error(error);
        res.send("An error occurred while rensending verification to a email. Please try again later.");
    }
});

module.exports = router;



