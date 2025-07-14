const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const fs = require("fs");
const cleanTmpImages = async () => {
    try {
        const files = await fs.promises.readdir("./tmpimg");

        const deleteFilePromises = files
            .map((file) => {
                const timestamp = Number(file.split("-")[0]);
                const ttl = 5 * 60 * 1000; // 5min
                const now = Date.now();
                if (now - timestamp > ttl) {
                    return fs.promises.unlink(`./tmpimg/${file}`);
                }
            })
            .filter((p) => !!p);

        await Promise.all(deleteFilePromises);

        logger.info("All files older than 5min deleted in ./tmpimg", {
            deletedFiles: deleteFilePromises.map((promise, index) => files[index])
        });

    } catch (err) {
        logger.error("Error deleting files in ./tmpimg:", err);
    }
};


module.exports = cleanTmpImages;