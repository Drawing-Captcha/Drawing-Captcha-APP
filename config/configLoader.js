const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
module.exports = (app) => {
    if (process.env.NODE_ENV !== 'Development') {
        app.set('trust proxy', 1)
    }
    app.set("view engine", "ejs")
}