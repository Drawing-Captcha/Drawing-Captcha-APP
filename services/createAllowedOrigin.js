const AllowedOriginModel = require("../models/AllowedOrigins.js");

async function createAllowedOrigin(companyId, origin) {
    try {
        console.log(`Trying to create a new allowed origin: ${origin} for company: ${companyId}`);
        const newOrigin = new AllowedOriginModel({
            allowedOrigin: origin,
            companies: [companyId],
            initOrigin: false
        });
        const result = await newOrigin.save();
        console.log(`Successfully created a new allowed origin: ${result.allowedOrigin} for company: ${result.company}`);
    } catch (error) {
        console.error(`Error occurred while creating a new allowed origin: ${error}`);
    }
}

module.exports = createAllowedOrigin;
