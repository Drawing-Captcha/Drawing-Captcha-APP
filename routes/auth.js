const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const UserModel = require("../models/User.js");
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs")
const path = require('path');
const sanitizeInput = require("../services/sanitizeInput.js");
const isValidEmail = require("../services/isValidEmail.js");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const registerKeyModel = require("../models/RegisterKey.js")
const isPasswordStrong = require("../services/isStrongPassword.js");
const generateEmailConfirmationToken = require("../services/generateEmailConfirmationToken.js");
const emailUser = process.env.DEFAULT_EMAIL_USER;
const emailPass = process.env.DEFAULT_EMAIL_PASS;

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
            return res.redirect("/login");
        }
        if (!user.isEmailConfirmed && emailUser && emailPass && !user.initialUser) {
            req.session.message = "Please confirm your email address before logging in.";
            return res.redirect("/login");
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.session.message = "Incorrect username or password.";
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

            if (emailUser && emailPass) {
                console.log("Sending email confirmation link to:", email);
    
                const token = generateEmailConfirmationToken(); 
                const confirmationLink = `http://${req.headers.host}/confirm-email?token=${token}`;
                let emailConfirmationToken = token;

                const transporter = nodemailer.createTransport({
                    host: process.env.DEFAULT_EMAIL_HOST,
                    port: process.env.DEFAULT_EMAIL_PORT,
                    secure: process.env.DEFAULT_EMAIL_PORT === '465', // true for 465, false for other ports
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                const mailOptions = {
                    from: emailUser,
                    to: email,
                    subject: 'Please confirm your email address',
                    text: `Please click the following link to confirm your email address: ${confirmationLink}`,
                    html: `<p>Please click the following link to confirm your email address: <a href="${confirmationLink}">Confirm Email</a></p>`,
                };

                await transporter.sendMail(mailOptions);

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
                req.session.RegisterMessage = "Registration successful!";
  
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

            await newUser.save();
            return res.redirect('/login');
        }

        req.session.RegisterMessage = "Register Key is wrong, please enter the register key given by your organization";
        return res.redirect('/register');

    } catch (error) {
        console.error("Error occurred during registration:", error);
        req.session.RegisterMessage = "An error occurred during registration. Please try again.";
        res.status(500).redirect('/register');
    }
});


module.exports = router

