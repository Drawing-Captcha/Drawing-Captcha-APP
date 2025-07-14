const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const sanitizeInput = require("../services/sanitizeInput.js");

router.post("/", csrfMiddleware.validateCSRFOrExternalKey, (req, res) => {
    try{
        logger.request(`Test connection with client from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
            operation: 'test_connection',
            ip: req.ip
        })
        res.json({message: "Successfully connected to the client.", connection: true}).status(200);
    }
    catch(error){
        logger.error(`Error occurred during test connection with client from IP: ${req.ip} and path: ${req.path} and origin: ${req.headers.origin}`, {
            operation: 'test_connection',
            ip: req.ip,
            error: error
        })
        res.json({message: "Error occurred during test connection with client.", connection: false}).status(500);
    }
});

module.exports = router