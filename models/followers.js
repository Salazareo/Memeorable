const mongo = require('mongoose');
// this schema contain THAT USER's followers
const FollowerSchema = mongo.Schema({
    username: {
        type: String,
        unique: true
    },
    numOfFollowers: {
        type: Number,
        required: true
    },
    followers: [String]
});
module.exports = mongo.model('Follower', FollowerSchema);