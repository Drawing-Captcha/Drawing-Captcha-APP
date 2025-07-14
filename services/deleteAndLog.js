const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

function deleteAndLog() {
    deleteAllFilesInDir("./tmpimg")
        .then(() => logger.info("All files deleted in ./tmpimg", { directory: "./tmpimg" }))
        .catch(error => logger.error("Error deleting files", error, { directory: "./tmpimg" }));
}

module.exports = deleteAndLog;
