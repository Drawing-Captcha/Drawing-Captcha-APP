const express = require('express');
const router = express.Router();
const User = require('../models/User.js');

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

module.exports = router;

