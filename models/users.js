let mongo = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let env_secrets = require("../secret.json");

const UserSchema = mongo.Schema({
    username: {
        type: String,
        required: 'All users need a username',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    darkmode: {
        type: Boolean,
        default: false
    },
    dateJoined: {
        type: Date,
        default: null
    },
    saltSecret: String,
    aboutMe: {
        type: String,
        default: "Hi, I have yet to fill out my About Me snippet!"
    },
    birthday: Date,
    Upvotes: {
        type: [String],
        default: []
    },
    Downvotes: {
        type: [String],
        default: []
    },
    followedTags: {
        type: [String],
        default: []
    },
    lastOnline: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
        type: String,
        default: "/assets/img/avatar/avatar-black.jpg"
    }
});

// Custom validation for email
// Not gonna lie, fuck this regex I stole it
UserSchema.path('email').validate(
    (val) => {
        emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,13}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(val);
    }, 'Invalid e-mail.');

// Events
UserSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            this.dateJoined = new Date();
            next();
        });
    });
});

UserSchema.methods.generateJwt = (username) => {
    return jwt.sign({
        username: username
    }, env_secrets.secret);
}




module.exports = mongo.model('User', UserSchema);