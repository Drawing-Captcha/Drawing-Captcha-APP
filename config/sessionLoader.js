const path = require("path");
const session = require("express-session");
const crypto = require("crypto");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const store = require("../models/store.js")

module.exports = (app) => {
    app.use(session({
        secret: crypto.randomUUID(),
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            maxAge: 30 * 60 * 1000,
            secure: process.env.NODE_ENV !== 'DEVELOPMENT',
            httpOnly: true
        }
    }));
}