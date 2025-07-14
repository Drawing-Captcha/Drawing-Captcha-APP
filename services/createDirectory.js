const fs = require('node:fs');
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

const folderName = './tmpimg';
function createDirectory(){
    try {
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
          logger.info("tmpimg directory successfully created")
        }
        else logger.info("tmpimg directory already exists")
      } catch (err) {
        logger.error(`Error creating directory ${folderName}`, { error: err.message, stack: err.stack });
      }
}


module.exports = createDirectory;