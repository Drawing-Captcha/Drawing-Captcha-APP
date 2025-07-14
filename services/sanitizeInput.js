const validator = require('validator');
const xss = require('xss');
const mongoSanitize = require('mongo-sanitize');

function sanitizeInput(input) {
    let sanitized = xss(input);

    sanitized = mongoSanitize(sanitized);

    return sanitized;
}

module.exports =  sanitizeInput;