const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const isAuthRedirect = require("../middlewares/isAlreadyAuthRedirectMiddleware")

router.get("/", (req, res) => {
    res.render("landing");
});

router.get('/login',isAuthRedirect ,csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken });
});

router.get('/register', csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('sign-up', {RegisterMessage: req.session.RegisterMessage, csrfToken: req.session.csrfToken});
});


module.exports = router