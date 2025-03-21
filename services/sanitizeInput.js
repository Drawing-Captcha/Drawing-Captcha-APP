const validator = require('validator');
const xss = require('xss');
const mongoSanitize = require('mongo-sanitize');

function sanitizeInput(input) {
    let sanitized = validator.escape(input);

    sanitized = xss(sanitized);

    sanitized = mongoSanitize(sanitized);

    return sanitized;
}

module.exports =  sanitizeInput;