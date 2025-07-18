const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 Minuten
    max: 20,
    message: "Too Many Request's try later again",
    delayMs: 300
});

const tokenLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 Minuten
    max: 30,
    message: "Too Many Request's try later again"
});

const captchaLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 Minuten
    max: 60,
    message: "Too Many Request's try later again"
});

const testLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 Minuten
    max: 30,
    message: "Too Many Request's try later again"
});

const dashboardLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 Minuten
    max: 100,
    message: "Too Many Request's try later again",
    delayMs: 500,
    headers: true
});

const socialAuthLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 Minuten
    max: 20, 
    message: "Too Many Request's try later again"
});

const emailConfirmationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Minuten
    max: 10,
    message: "Too Many Request's try later again"
});

const siteVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Minuten
    max: 8,
    message: "Too Many Request's try later again"
});

module.exports = {
    authLimiter,
    tokenLimiter,
    captchaLimiter,
    testLimiter,
    dashboardLimiter,
    socialAuthLimiter,
    emailConfirmationLimiter,
    siteVerifyLimiter
}