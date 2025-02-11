const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");


router.post("/", csrfMiddleware.validateCSRFOrExternalKey, (req, res) => {
    try{
        console.log("Test connection with client from:", req.headers.origin, "was successful");
        res.json({message: "Successfully connected to the client.", connection: true}).status(200);
    }
    catch(error){
        console.error("Error occurred during test connection with client:", error);
    }
});

module.exports = router