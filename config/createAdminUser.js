const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAdminUser() {
    try {
        const existingAdmin = await UserModel.findOne({ role: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        let password = process.env.DC_ADMIN_PASSWORD;
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new UserModel({
            username: "Administrator",
            email: process.env.DC_ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin"
        });

        await newUser.save();
        console.log("Admin user created successfully");
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
}

module.exports = createAdminUser;