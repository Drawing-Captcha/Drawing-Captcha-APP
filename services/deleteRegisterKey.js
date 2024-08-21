const RegisterKeyModel = require("../models/RegisterKey.js")

async function deleteRegisterKey(companyId) {
    try {
        console.log(`Register Key for company ID ${companyId} wird gelöscht.`);
        const registerKey = await RegisterKeyModel.findOneAndDelete({ Company: companyId });
        if (!registerKey) {
            console.log(`Kein Register Key für die Firma ${companyId} gefunden.`);
        }
    } catch (error) {
        console.error(`Fehler beim Löschen des Register Keys für Firma ${companyId}:`, error);
    }
}

module.exports = deleteRegisterKey;