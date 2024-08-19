const RegisterKeyModel = require("../models/RegisterKey.js");
const CompanyModel = require("../models/Company.js");
const crypto = require('crypto');

async function createCompanyRegisterKey(companyId) {
    try {
        const companyKeyExists = await RegisterKeyModel.findOne({ Company: companyId });
        if (companyKeyExists) {
            return { success: false, message: "A register key for this company already exists." };
        }

        const Key = new RegisterKeyModel({
            RegisterKey: crypto.randomUUID(),
            Company: companyId
        });

        await Key.save();

        return { success: true, message: "Company register key successfully created.", Key };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An error occurred while creating the company register key." };
    }
}

module.exports = createCompanyRegisterKey;