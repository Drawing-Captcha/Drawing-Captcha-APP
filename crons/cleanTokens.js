const callbackTokenModel = require("../models/CallbackToken.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function cleanTokens() {
    try {
        const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
        const now = Date.now();

        const result = await callbackTokenModel.deleteMany({
            issuedAt: { $lt: now - FIVE_MINUTES_IN_MS }
        });
        logger.info(`${result.deletedCount} Enteries were deleted from the CallbackToken Collection.`);
    } catch (error) {
        console.error("Fehler beim Löschen alter Tokens:", error);
    }
}

module.exports = cleanTokens;
