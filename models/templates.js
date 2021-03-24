const mongo = require('mongoose');

const TemplateSchema = mongo.Schema({
    tLink: {
        type: String,
        required: true
    },
    tDesc: {
        type: String
    },
    username: {
        type: String,
        required: true
    }
});

module.exports = mongo.model('Template', TemplateSchema);