const crypto = require("crypto");

function generateUniqueName(FileName) {
    const timestamp = new Date().getTime();
    const randomValue = crypto.randomBytes(8).toString("hex");
    const fileExtension = FileName.split(".").pop();

    return `${timestamp}-${randomValue}.${fileExtension}`;
}

module.exports = { generateUniqueName };