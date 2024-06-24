const registerKeyModel = require("../models/RegisterKey.js")
const crypto = require("crypto");

async function generateRegisterKey(req, res){
    let message;
    const existingRegisterKey = await registerKeyModel.findOne();

    if (!existingRegisterKey) {
        const newRegisterKey = new registerKeyModel({
            RegisterKey: crypto.randomUUID()
        });

        await newRegisterKey.save();
        message = "New register key successfully generated";
        console.log(message);
        return res.status(201).json({ success: true, message, key: newRegisterKey.RegisterKey });
    } else {
        existingRegisterKey.RegisterKey = crypto.randomUUID();
        await existingRegisterKey.save();
        message = "Register key successfully updated";
        console.log(message);
        return res.status(200).json({ success: true, message, key: existingRegisterKey.RegisterKey });

    }
}

module.exports = generateRegisterKey;