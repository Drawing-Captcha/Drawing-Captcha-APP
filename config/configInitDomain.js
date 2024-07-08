const AllowedOriginModel = require("../models/AllowedOrigins.js");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function configInitDomain() {
    try {
        const allowedOrigin = await AllowedOriginModel.findOne({ initOrigin: true });
        if (!allowedOrigin) {
            const newOrigin = new AllowedOriginModel({
                allowedOrigin: process.env.SERVER_DOMAIN,
                initOrigin: true
            });
            await newOrigin.save();
            console.log("Initial Origin successfully created")
        }
        console.log("Initial Origin already exists")
    } catch (error) {
        console.error("Error occurred while fetching allowed origins:", error);
    }
}

module.exports = configInitDomain;
