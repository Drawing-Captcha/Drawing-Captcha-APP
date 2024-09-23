const ApiKeyModel = require("../models/ApiKey.js")

async function deleteApiKeyRelation(companyId) {
    try {
        console.log(`Deleting all Api Keys with company ID ${companyId}`);
        const apiKeys = await ApiKeyModel.deleteMany({ companies: { $in : companyId } })
        if (!apiKeys) {
            console.log(`No Api Keys found for company ID ${companyId}.`);
        }
    } catch (error) {
        console.error(`An error occurred while deleting Api Keys relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteApiKeyRelation;
