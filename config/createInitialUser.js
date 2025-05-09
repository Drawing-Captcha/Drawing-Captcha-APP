const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createInitialUser() {
    try {
        const existingInitialUser = await UserModel.findOne({ initialUser: true });
        if (existingInitialUser) {
            console.log("InitialUser user already exists");
            return;
        }

        let password = process.env.DC_ADMIN_PASSWORD;
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new UserModel({
            username: "Administrator",
            email: process.env.DC_ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
            initialUser: true,
            appAdmin: true
        });

        await newUser.save();
        console.log("InitialUser user created successfully");
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
}

module.exports = createInitialUser;