const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    message: "Too Many Request's try later again",
    delayMs: 1000
});
const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too Many Request's try later again"
});
const captchaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again"
});
const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again"
});
const dashboardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too Many Request's try later again",
    delayMs: 2000,
    headers: true
});
const socialAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 30, 
    message: "Too Many Request's try later again"
});
const emailConfirmationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too Many Request's try later again"
});
const siteVerifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
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