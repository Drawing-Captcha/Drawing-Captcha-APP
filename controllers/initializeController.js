const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const AllowedOriginModel = require("../models/AllowedOrigins.js");
const { promises: fsPromises } = require('fs');
const CaptchaModel = require("../models/Captcha.js")
const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")
const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
let pool = [];
let deletedBin = [];
let allowedOrigins = [];
const port = process.env.PORT;
let defaultOrigin = [`http://localhost:${port}`, process.env.SERVER_DOMAIN];

async function initializePool() {
    try {
        const pool = await CaptchaModel.find({});
        if (pool.length === 0) {
            logger.info("The pool collection in the Database is empty", {
                operation: 'initialize_pool'
            })
            return [];
        } else {
            return pool;
        }
    } catch (err) {
        logger.error('Error retrieving data from Database:', { error: err.message, stack: err.stack, operation: 'initialize_pool' });
        return [];
    }
}

async function initializeAllowedOrigins() {
    try {
        allowedOrigins = await AllowedOriginModel.find({});
        if (allowedOrigins.length > 0) {
            allowedOrigins.forEach(origin => {
                defaultOrigin.push(origin.allowedOrigin);
            });
            defaultOrigin = [...new Set(defaultOrigin)];
            return defaultOrigin;
        } else {
            logger.info("Allowed origins are currently empty. Added localhost as default.",{
                operation: 'initialize_allowed_origins'
            });
            return defaultOrigin;
        }
    } catch (err) {
        logger.error('Error retrieving data from Database:', { error: err.message, stack: err.stack, operation: 'initialize_allowed_origins' });
    }
}


async function initializeBin() {
    try {
        const bin = await DeletedCaptchaModel.find({});
        if (bin.length === 0) {
            logger.warn("The bin collection in the Database is empty", {
                operation: 'initialize_bin'
            });
            return [];
        } else {
            return bin;
        }
    } catch (err) {
        logger.error('Error retrieving data from Database:', { error: err.message, stack: err.stack, operation: 'initialize_bin' });
        return [];
    }
}

async function initializeRegisterKey() {
    try {
        let message;
        const existingRegisterKey = await registerKeyModel.findOne({ AppKey: true });

        if (!existingRegisterKey) {
            const newRegisterKey = new registerKeyModel({
                RegisterKey: crypto.randomUUID(),
                AppKey: true
            });

            await newRegisterKey.save();
            message = "New register key successfully generated";
                logger.info(`New register key: ${newRegisterKey}`, {
                    operation: 'initialize_register_key'
                });
            return message;
        } else {
            existingRegisterKey.RegisterKey = crypto.randomUUID();
            await existingRegisterKey.save();
            message = "Register key successfully updated";
            logger.info(message, {
                operation: 'update_register_key'
            });
            return message;

        }
    } catch (error) {
        logger.error('Error updating register key:', { error: error.message, stack: error.stack });
    }
}

module.exports = {
    get pool() {
        return initializePool();
    },
    get deletedBin() {
        return initializeBin();
    },
    get defaultOrigin() {
        return initializeAllowedOrigins();
    },
    initializeAllowedOrigins,
    initializeBin,
    initializePool,
    initializeRegisterKey
};
