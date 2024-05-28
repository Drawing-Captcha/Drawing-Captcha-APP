const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");

router.get("/", (req, res) => {
    res.render("landing");
});

router.get('/login', csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken });
});

router.get("/register", (req, res) => {
    res.render("register");
});

module.exports = router