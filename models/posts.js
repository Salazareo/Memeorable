const mongo = require('mongoose');

const PostSchema = mongo.Schema({
    pLink: {
        type: String,
        required: true
    },
    pTags: {
        type: [String],
        required: false
    },
    username: {
        type: String,
        required: true
    },
    epoch: {
        type: Number,
        required: true
    },
    tID: String,
    profilePicture: String,
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    comments: [{
        username: String,
        comment: String
    }]

});

module.exports = mongo.model('Post', PostSchema);