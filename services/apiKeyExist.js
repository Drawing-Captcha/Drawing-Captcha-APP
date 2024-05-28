const ApiKeyModel = require("../models/ApiKey.js")


async function doesApiKeyExist(key) {
    let apiKeyExists = await ApiKeyModel.findOne({ apiKey: key })
    return apiKeyExists;
}

module.exports = doesApiKeyExist