const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")
const path = require('path');
const sanitizeInput = require("../services/sanitizeInput.js");
const isValidEmail = require("../services/isValidEmail.js");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const registerKeyModel = require("../models/RegisterKey.js")
const isPasswordStrong = require("../services/isStrongPassword.js");
const sendEmail = require('../services/sendEmail.js');
const generateEmailConfirmationToken = require("../services/generateEmailConfirmationToken.js");
const { send } = require('process');
const emailService = process.env.EMAIL_SERVICE;
let basicAuth = process.env.BASIC_AUTH === 'true';


if (basicAuth) {
    router.post("/login", csrfMiddleware.validateCSRFToken, async (req, res) => {
        try {
            const { email, password } = req.body;
            const cleanedMail = sanitizeInput(email);
            let user = null;
            if (isValidEmail(cleanedMail)) {
                user = await UserModel.findOne({ email: cleanedMail });
            }
            if (!user) {
                req.session.message = "Incorrect username or password.";
                req.session.resendConfirmEmail = false;
                return res.redirect("/login");
            }
            if (!user.isEmailConfirmed && emailService && !user.initialUser) {
                req.session.message = "Please confirm your email address before logging in.";
                req.session.resendConfirmEmail = true;
                return res.redirect("/login");
            }
            const isMatch = await bcrypt.compare(password, user.password);
    
            if (!isMatch) {
                req.session.message = "Incorrect username or password.";
                req.session.resendConfirmEmail = false;
                return res.redirect("/login");
            }
    
            req.session.user = user;
            req.session.message = "";
            req.session.isAuth = true;
    
            req.session.save((err) => {
                if (err) {
                    console.error("Error saving session:", err);
                    return res.status(500).json({ message: 'An error occurred while saving the session' });
                }
                res.redirect('/dashboard');
            });
        } catch (error) {
            console.error("Error during login process:", error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    })
}

router.post('/register', csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const { username, email, password, registerKey } = {
            username: sanitizeInput(req.body.username),
            email: sanitizeInput(req.body.email),
            password: sanitizeInput(req.body.password),
            registerKey: sanitizeInput(req.body.registerKey)
        };

        const registerKeyDB = await registerKeyModel.findOne({ RegisterKey: registerKey });
        if (!registerKeyDB) {
            req.session.RegisterMessage = "Register Key is wrong, please enter the register key given by your organization";
            return res.redirect('/register');
        }

        const returnedKey = registerKeyDB.RegisterKey;
        const companyKeyId = registerKeyDB.Company;


        req.session.RegisterMessage = "";

        if (!isPasswordStrong(password)) {
            req.session.RegisterMessage = "Password is not strong enough. Please enter a password with at least 8 characters, 1 uppercase letter, 1 lowercase letter and 1 special character.";
            return res.redirect('/register');
        }

        if (registerKey === returnedKey) {
            const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });

            if (existingUser) {
                req.session.RegisterMessage = "User with this email or username already exists";
                return res.redirect('/register');
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            let newUser; 

            if (emailService) {    
                const token = generateEmailConfirmationToken();
                const confirmationLink = `http://${req.headers.host}/confirm-email?token=${token}`;
                let emailConfirmationToken = token;

                let subject = 'Drawing-Captcha | Email Confirmation';
                let text = `Please click the following link to confirm your email address: ${confirmationLink}`;
                let html = `<div style="width: 100%; height: fit-content; display: flex; align-items: center; justify-content: center;"><img src="https://docs.drawing-captcha.com/media/3yih32u5/drawing-captcha_small.png?width=240&v=1db77deb55dccb0" styles="width: 100px; height: 100px;"></div><h1>Confirm your Email for ${req.headers.host} Drawing Captcha App</h1><p>Please click the following link to confirm your email address: <a href="${confirmationLink}">Confirm Email here</a></p>`;

                await sendEmail(subject, text, html, email);

                req.session.RegisterMessage = "Registration successful! Please check your email to confirm your address.";
                newUser = new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    role: "read",
                    company: companyKeyId,
                    isEmailConfirmed: false,
                    emailConfirmationToken
                });
  
            } else {
                newUser = new UserModel({
                    username,
                    email,
                    password: hashedPassword,
                    role: "read",
                    company: companyKeyId
                });
                req.session.RegisterMessage = "Registration successful!";
            }

            req.session.message = req.session.RegisterMessage;
            req.session.isSuccessfull = true;

            await newUser.save();
            return res.redirect("/login");
        }
        else {
            req.session.RegisterMessage = "Register Key is wrong, please enter the register key given by your organization";
            return res.redirect('/register');
        }

    } catch (error) {
        console.error("Error occurred during registration:", error);
        req.session.RegisterMessage = "An error occurred during registration. Please try again.";
        res.status(500).redirect('/register');
    }
});


module.exports = router

