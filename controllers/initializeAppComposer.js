const configInitDomain = require("../config/configInitDomain.js")
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createInitColorKit = require("../config/createInitColorKit.js")
const createDirectory = require("../services/createDirectory.js")
const configureJWTSecret = require("../config/configJWTSecret.js")
const createInitCaptcha = require("../config/createInitCaptcha.js")
const cleanTokens = require("../crons/cleanTokens.js");
const cleanSessions = require("../crons/cleanSessions.js");
const generateNewRegisterKey = require("../services/generateRegisterKey.js")
const deleteAndLog = require("../services/deleteAndLog.js")
const connectDB = require("../config/db.js")
const { pool, deletedBin } = require("./initializeController.js")
const deleteAllFilesInDir = require("../services/deleteAllFilesInDir.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function initializeAppComposer() {
    deleteAllFilesInDir("./tmpimg").then(() => logger.info("All files deleted in ./tmpimg")).catch(err => logger.error('Error deleting files:', err));

    setInterval(deleteAndLog, 1000 * 60 * 60 * 24);
    setInterval(generateNewRegisterKey, 1000 * 60 * 60 * 24);
    setInterval(() => {
        logger.info('Running session cleanup...');
        cleanSessions();
    }, 1000 * 60 * 60)
    setInterval(() => {
        logger.info('Running token cleanup...');
        cleanTokens();
    }, 1000 * 60 * 5);

    createDirectory()
    connectDB()
    createInitCaptcha()
    createInitColorKit()
    configInitDomain()
    configureJWTSecret()

    async function getSource() {
        await pool
        await deletedBin
    }
    getSource().then(() => {
        logger.info("src initialized")
    }).catch(err => {
        logger.error('Error initializing src:', { error: err.message, stack: err.stack });
    })
}

module.exports = initializeAppComposer

