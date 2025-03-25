const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const isAuthRedirect = require("../middlewares/isAlreadyAuthRedirectMiddleware")

router.get("/", (req, res) => {
    res.redirect("/login");
});

router.get('/login',isAuthRedirect ,csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken, isSuccessfull: req.session.isSuccessfull, resendConfirmEmail: req.session.resendConfirmEmail });
});

router.get('/register', csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('sign-up', {RegisterMessage: req.session.RegisterMessage, csrfToken: req.session.csrfToken, isSuccessfull: req.session.isSuccessfull});
});

router.get('/resendEmailVerification', csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('resendEmailVerification', {ResendMailMessage: req.session.ResendMailMessage, csrfToken: req.session.csrfToken, isSuccessfullResending: req.session.isSuccessfullResending});
});

router.get('/404', (req, res) => {
    res.status(404).render('404');
});


module.exports = router