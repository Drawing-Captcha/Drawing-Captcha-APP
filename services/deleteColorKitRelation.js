const ColorKitModel = require("../models/ColorKit.js")

async function deleteColorKitRelation(companyId) {
    try {
        console.log(`Color Kits for company ID ${companyId} wird gelöscht.`);
        const colorKits = await ColorKitModel.findOneAndDelete({ company: companyId })
        if (!colorKits) {
            console.log(`Kein Color Kit für die Firma ${companyId} gefunden.`);
        }
    } catch (error) {
        console.error(`An error occurred while deleting Color Kits relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteColorKitRelation;
