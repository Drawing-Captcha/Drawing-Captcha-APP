const fs = require("fs");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
async function deleteFile(filePath) {
    try {
        const exists = fs.existsSync(filePath);
        if (!exists) {
            logger.info(`The file ${filePath} does not exist.`, { details: `The file ${filePath} does not exist.` });
            return;
        }

        await fs.unlink(filePath, () => { });
        logger.info(`${filePath} successfully deleted!`, { details: `${filePath} successfully deleted!` });
    } catch (err) {
        logger.error(`Error deleting file ${filePath}: ${err}`, { details: `Error deleting file ${filePath}: ${err}` });
    }
}

module.exports = { deleteFile }
