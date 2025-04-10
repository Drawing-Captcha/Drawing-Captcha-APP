const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const isAuthRedirect = require("../middlewares/isAlreadyAuthRedirectMiddleware")
const emailService = process.env.EMAIL_SERVICE;
router.get("/", (req, res) => {
    res.redirect("/login");
});

router.get('/login',isAuthRedirect ,csrfMiddleware.generateCSRFToken, (req, res) => {
    let basicAuth = process.env.BASIC_AUTH === 'true';
    let divider = false;
    let msSignUp = false;
    let googleSignUp = false;
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
        msSignUp = true;
    }
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        googleSignUp = true;
    }
    if (msSignUp && basicAuth || googleSignUp && basicAuth) {
        divider = true;
    }
    res.render('login', { message: req.session.message, csrfToken: req.session.csrfToken, isSuccessfull: req.session.isSuccessfull, resendConfirmEmail: req.session.resendConfirmEmail, basicAuth, divider, msSignUp, googleSignUp });
});

router.get('/register', csrfMiddleware.generateCSRFToken, (req, res) => {
    res.render('sign-up', {RegisterMessage: req.session.RegisterMessage, csrfToken: req.session.csrfToken, isSuccessfull: req.session.isSuccessfull});
});

router.get('/resendEmailVerification', csrfMiddleware.generateCSRFToken, (req, res) => {
    if(emailService){
        res.render('resendEmailVerification', {ResendMailMessage: req.session.ResendMailMessage, csrfToken: req.session.csrfToken, isSuccessfullResending: req.session.isSuccessfullResending});
    }
});

router.get('/404', (req, res) => {
    res.status(404).render('404');
});


module.exports = router