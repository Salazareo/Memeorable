const mongo = require('mongoose');
// this schema contain users that THAT USER is following
const FollowingSchema = mongo.Schema({
    username: {
        type: String,
        required: 'All users need a username',
        unique: true
    },
    numOfFollowing: {
        type: Number

    },
    following: {
        type: [String]
    }
});

module.exports = mongo.model('Following', FollowingSchema);