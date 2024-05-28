const fs = require("fs");

async function deleteFile(filePath) {
    try {
        const exists = fs.existsSync(filePath);
        if (!exists) {
            console.log(`The file ${filePath} does not exist.`);
            return;
        }

        await fs.unlink(filePath, () => { });
        console.log(`${filePath} successfully deleted!`);
    } catch (err) {
        console.error(`Error deleting file ${filePath}: ${err}`);
    }
}

module.exports = {deleteFile}