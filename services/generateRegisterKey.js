const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");

async function generateRegisterKey(req, res){
    console.log("Generating or updating register key...");
    let message;
    let existingRegisterKey;
    if(req.body.isAppKey){
        console.log("Checking if app key exists...");
        existingRegisterKey = await registerKeyModel.findOne({AppKey: true});
        console.log("App key exists:", existingRegisterKey != null);
    }
    else{
        console.log("Checking if company register key exists...");
        existingRegisterKey = await registerKeyModel.findOne({Company: req.body.companyId});
        console.log("Company register key exists:", existingRegisterKey != null);
    }

    if (!existingRegisterKey) {
        console.log("Register key does not exist, generating new one...");
        const newRegisterKey = new registerKeyModel({
            RegisterKey: crypto.randomUUID(),
            Company: req.body.companyId,
            AppKey: req.body.isAppKey
        });

        await newRegisterKey.save();
        message = "New register key successfully generated";
        console.log(message);
        console.log("New register key:", newRegisterKey);
        return res.status(201).json({ success: true, message, key: newRegisterKey.RegisterKey });
    } else {
        console.log("Register key exists, updating...");
        existingRegisterKey.RegisterKey = crypto.randomUUID();
        existingRegisterKey.AppKey = req.body.isAppKey;
        existingRegisterKey.Company = req.body.companyId;
        await existingRegisterKey.save();
        message = "Register key successfully updated";
        console.log(message);
        console.log("Updated register key:", existingRegisterKey);
        return res.status(200).json({ success: true, message, key: existingRegisterKey.RegisterKey });

    }
}

module.exports = generateRegisterKey;