const express = require("express");
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const decodeJWTToken = require("../services/decodeJWTToken.js");


router.post("/callback", async (req, res) => {
    try {
        console.log("SiteVerifyCallback: Received callback request with token: ", req.body.token);
        const token = req.body.token;
        const decodedToken = await decodeJWTToken(token);
        if (!decodedToken) {
            console.warn("SiteVerifyCallback: Invalid token");
            return res.status(401).json({ isValid: false, message: "Invalid token" });
        }
        if (Date.now() - decodedToken.issuedAt > 5 * 60 * 1000) {
          console.warn("SiteVerifyCallback: Token abgelaufen");
          return res.status(400).json({ isValid: false, message: 'Token abgelaufen' });
        }
        console.info("SiteVerifyCallback: Callback successful");
        res.json({ isValid: true, message: "Callback successful" });
    } catch (error) {
        console.error("SiteVerifyCallback:", error);
        res.status(500).json({ isValid: false, message: "Internal Server Error" });
    }
});

module.exports = router;