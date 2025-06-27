const fs = require('fs');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
    logger.info('Created logs directory');
}