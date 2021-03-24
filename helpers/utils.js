const validator = require('validator');
const createDOMPurify = require('dompurify');
const {
    JSDOM
} = require('jsdom');

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

module.exports.sanitizeText = function(text){
    return DOMPurify.sanitize(text);
}

module.exports.sanitizeUsername = function (username) {
    const cleanUsername = this.sanitizeText(username);
    return validator.isAlphanumeric(cleanUsername) ? cleanUsername : null;
}

module.exports.sanitizePassword = function (password) {
    const cleanPassword = this.sanitizeText(password);
    return validator.isAlphanumeric(cleanPassword) ? cleanPassword : null;
}

module.exports.sanitizeEmail = function (email) {
    const cleanEmail = this.sanitizeText(email);
    return validator.isEmail(cleanEmail) ? cleanEmail : null;
}

module.exports.sanitizeBooleanInput = function (text) {
    const cleanText = this.sanitizeText(text);
    return validator.isBoolean(cleanText) ? cleanText.toLowerCase() === 'true' : null;
}