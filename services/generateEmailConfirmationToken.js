const crypto = require('crypto');

function generateEmailConfirmationToken() {
    return crypto.randomBytes(32).toString('hex'); 
}

module.exports = generateEmailConfirmationToken;
