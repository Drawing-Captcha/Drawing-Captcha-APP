const validator = require('validator');

function isValidEmail(email) {
    return validator.isEmail(email);
}

module.exports = isValidEmail;