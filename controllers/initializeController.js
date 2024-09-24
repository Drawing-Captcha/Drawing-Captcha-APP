const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const AllowedOriginModel = require("../models/AllowedOrigins.js");
const { promises: fsPromises } = require('fs');
const CaptchaModel = require("../models/Captcha.js")
const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")
const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");

let pool = [];
let deletedBin = [];
let allowedOrigins = [];
const port = process.env.PORT;
let defaultOrigin = [`http://localhost:${port}`, process.env.SERVER_DOMAIN];

async function initializePool() {
    try {
        const pool = await CaptchaModel.find({});
        if (pool.length === 0) {
            console.log("The pool collection in MongoDB is empty");
            return [];
        } else {
            return pool;
        }
    } catch (err) {
        console.log("Error retrieving data from MongoDB:", err);
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
            return defaultOrigin;
            console.log("Allowed origins: ", defaultOrigin);
        } else {
            return defaultOrigin;
            console.log("Allowed origins are currently empty. Added localhost as default.");
        }
    } catch (err) {
        console.log("Error parsing JSON data while initializing allowedOrigins:", err);
    }
}

async function initializeBin() {
    try {
        const bin = await DeletedCaptchaModel.find({});
        if (bin.length === 0) {
            console.log("The deleted bin collection in MongoDB is empty");
            return [];
        } else {
            return bin;
        }
    } catch (err) {
        console.log("Error retrieving data from MongoDB:", err);
        return [];
    }
}

async function initializeRegisterKey() {
    try {
        let message;
        const existingRegisterKey = await registerKeyModel.findOne({AppKey: true});

        if (!existingRegisterKey) {
            const newRegisterKey = new registerKeyModel({
                RegisterKey: crypto.randomUUID(),
                AppKey: true
            });

            await newRegisterKey.save();
            message = "New register key successfully generated";
            console.log(message);
            console.log("New register key:", newRegisterKey);
            return message;
        } else {
            existingRegisterKey.RegisterKey = crypto.randomUUID();
            await existingRegisterKey.save();
            message = "Register key successfully updated";
            console.log(message);
            console.log("Updated register key:", existingRegisterKey);
            return message;

        }
    } catch (error) {
        console.error("Error initializing register key:", error);
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
