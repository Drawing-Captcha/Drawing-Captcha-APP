const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const createInitialUser = require("../config/createInitialUser.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose.connect(mongoUri);
        logger.info('Database successfully connected with server', {
            operation: 'database_connection',
            ip: 'localhost'
        });
    } catch (err) {
        logger.error(`Error connecting to database: ${err.message}`, {
            operation: 'database_connection',
            ip: 'localhost',
            error: err
        });
        process.exit(1);
    }
};

createInitialUser();
module.exports = connectDB;