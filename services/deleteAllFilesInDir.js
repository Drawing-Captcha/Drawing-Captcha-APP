const fs = require("fs");
const path = require("path");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function deleteAllFilesInDir(dirPath) {
    try {
        const files = await fs.promises.readdir(dirPath);

        const deleteFilePromises = files.map(async (file) => {
            const filePath = path.join(dirPath, file);
            await fs.promises.unlink(filePath);
        });

        await Promise.all(deleteFilePromises);
    } catch (err) {
        logger.error(`Error deleting files in directory ${dirPath}:`, { error: err.message, stack: err.stack });
    }
}

module.exports = deleteAllFilesInDir;