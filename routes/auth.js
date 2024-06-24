const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const registerKeyModel = require("../models/RegisterKey.js")

router.post("/login", csrfMiddleware.validateCSRFToken, async (req, res) => {
    const { email, password } = req.body;
    let user = await UserModel.findOne({ email });

    if (!user) {
        req.session.message = "Incorrect username or password.";
        return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        req.session.message = "Incorrect username or password.";
        return res.redirect("/login");
    }

    req.session.user = user;

    req.session.message = "";

    req.session.isAuth = true

    req.session.save((err) => {
        if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ message: 'An error occurred while saving the session' });
        }
        res.redirect('/dashboard');
    });    
})

router.post('/register', csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        console.log("Registering User...")
        const { username, email, password, registerKey } = req.body;
        const registerKeyENV = process.env.REGISTER_KEY;
        const registerKeyDB = await registerKeyModel.findOne({});
        console.log(registerKeyDB)
        const returnedKey = registerKeyDB != null && registerKeyDB.RegisterKey != null ? registerKeyDB.RegisterKey : registerKeyENV;
    
        console.log("register Key: ", returnedKey)
    
        req.session.RegisterMessage = "";
    
        if (registerKey === returnedKey) {
            const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });

            if (existingUser) {
                req.session.RegisterMessage = "User with this email or username already exists";
                return res.redirect('/register');
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                role: "read"
            });

            await newUser.save();
            console.log("registering user successfull...")

            return res.redirect('/login'); 
        }

        console.log("registering user unsuccessfull...")
        req.session.RegisterMessage = "Register Key is wrong, please enter the register key given by your organization";
        return res.redirect('/register');

    } catch (error) {
        console.error("Error occurred during registration:", error);
        req.session.RegisterMessage = "An error occurred during registration. Please try again.";
        res.status(500).redirect('/register');
    }
});


module.exports = router