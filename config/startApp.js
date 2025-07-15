const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const { initializeAllowedOrigins, initializeRegisterKey } = require("../controllers/initializeController.js")
const port = process.env.PORT;
const store = require("../models/store.js")

module.exports = (app) => {
    app.listen(port, async () => {
        try {
            logger.info(`Server Running on port: ${port}`);
            store.collection.deleteMany({}, (err) => {
                if (err) {
                    logger.error('Error while trying to delete Sessions:', { error: err.message, stack: err.stack });
                } else {
                    logger.info('All Sessions cleared successfully.');
                }
            });
            await initializeRegisterKey();
        }
        catch (err) {
            logger.error('Error clearing session store:', { error: err.message, stack: err.stack });
        }

    })
}