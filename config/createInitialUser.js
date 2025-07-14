const UserModel = require("../models/User.js");
const bcrypt = require("bcryptjs")
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function createInitialUser() {
    try {
        const existingInitialUser = await UserModel.findOne({ initialUser: true });
        if (existingInitialUser) {
            logger.info("InitialUser user already exists", {
                operation: 'create_initial_user',
                userId: existingInitialUser._id
            });
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
        logger.info("InitialUser user created successfully", {
            operation: 'create_initial_user',
            userId: newUser._id
        });
    }
    catch (error) {
        logger.error("Error occurred during admin initialization:", {
            error: error,
            operation: 'create_initial_user'
        });
    }
}

module.exports = createInitialUser;