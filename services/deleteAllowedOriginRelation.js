const AllowedOriginModel = require("../models/AllowedOrigins.js")

async function deleteAllowedOriginRelation(companyId) {
    try {
        console.log(`Allowed Origins for company ID ${companyId} wird gelöscht.`);
        const allowedOrigins = await AllowedOriginModel.deleteMany({ companies: { $in : companyId } })
        if (!allowedOrigins) {
            console.log(`No alloed origin found for company ID ${companyId}.`);
        }
    } catch (error) {
        console.error(`An error occurred while deleting allowed Origins relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteAllowedOriginRelation;