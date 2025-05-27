const callbackTokenModel = require("../models/CallbackToken.js");

async function cleanTokens() {
    try {
        const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
        const now = Date.now();

        const result = await callbackTokenModel.deleteMany({
            issuedAt: { $lt: now - FIVE_MINUTES_IN_MS }
        });

        console.log(`${result.deletedCount} Einträge wurden gelöscht.`);
    } catch (error) {
        console.error("Fehler beim Löschen alter Tokens:", error);
    }
}

module.exports = cleanTokens;
