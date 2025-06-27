const AllowedOriginModel = require("../models/AllowedOrigins.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function configInitDomain() {
    try {
        const allowedOrigin = await AllowedOriginModel.findOne({ initOrigin: true });
        if (!allowedOrigin) {
            const newOrigin = new AllowedOriginModel({
                allowedOrigin: process.env.SERVER_DOMAIN,
                initOrigin: true
            });
            await newOrigin.save();
            logger.info("Initial Origin successfully created")
        }
        logger.info("Initial Origin already exists");
    } catch (error) {
        logger.error("Error occurred while fetching allowed origins:", {
            error: error,
            operation: 'config_init_domain'
        });
    }
}

module.exports = configInitDomain;
