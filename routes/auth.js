const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")

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

    res.redirect("/dashboard")
})

router.post("/register", async (req, res) => {
    const { username, email, password, key } = req.body;

    try {
        let user = await UserModel.findOne({ email });

        if (user) {
            return res.redirect('register');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user = new UserModel({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.redirect("/login");
    } catch (error) {
        console.error("Error occurred during registration:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router