let User = require('../models/users');
let favTemplate = require('../models/fav_template');
let followers = require('../models/followers');
let following = require('../models/following');
let Notifications = require('../models/notifications');
let bcrypt = require('bcryptjs');
let passport = require('passport');
let utils = require('../helpers/utils.js');


module.exports.updateUserInfo = (req, res, next) => {
    User.findOneAndUpdate({
        username: req.username
    }, {
        $set: req.body
    }, (err, result) => {
        if (err) {
            return res.status(200).send(err);
        } else {
            return res.status(200).send(result);
        }
    });
}

module.exports.getPublicUserInfo = (req, res) => {
    User.findOne({
            username: req.params.username
        }, {
            password: 0,
            saltSecret: 0,
            email: 0,
            darkmode: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0,
            _id: 0,
            __v: 0
        },
        (err, user) => {
            if (err) {
                res.status(500).send(err);
            }
            if (!user) {
                res.status(404).send();
            } else {
                res.status(200).send(user);
            }
        }
    );
}

module.exports.searchUser = (req, res) => {
    let cleanTag = utils.sanitizeText(req.params.user);
    let regx = new RegExp('.*' + cleanTag + '.*');
    if (!regx) {
        return res.status(500).send();
    }
    User.find({
        username: regx
    }, {
        username: 1,
        profilePicture: 1
    }, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            let ret = result.slice((req.params.amount - 1) * 8, req.params.amount * 8);
            return res.send(ret);
        }
    });
}

module.exports.getPrivateUserInfo = (req, res) => {
    User.findOne({
            username: req.username
        }, {
            password: 0,
            saltSecret: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0,
            _id: 0,
            __v: 0
        },
        (err, user) => {
            if (err) {
                res.status(500).send(err);
            }
            if (!user) {
                res.status(404).send();
            } else {
                res.status(200).send(user);
            }
        }
    );
}

module.exports.authenticate = (req, res) => {
    // call for passport authentication
    passport.authenticate('local', (err, user) => {
        // error from passport middleware
        if (err) {
            return res.status(500).send();
            //return res.status(404).json("error");
        }
        // registered user
        if (user) {
            return res.status(200).send(user.generateJwt(user.username));
        }
        // unknown user or wrong password
        else {
            return res.status(401).send();
        }
    })(req, res);
}

module.exports.register = (req, res) => {
    const validUsername = utils.sanitizeUsername(req.body.username);
    const validPassword = utils.sanitizePassword(req.body.password);
    const validEmail = utils.sanitizeEmail(req.body.email);
    const validDarkness = utils.sanitizeBooleanInput(req.body.darkmode) ? null : false;

    if (validUsername === null ||
        validPassword === null ||
        validEmail === null ||
        validDarkness === null) {
        return res.status(400).send('Invalid input.');
    }


    let newUser = new User({
        username: validUsername,
        password: validPassword,
        email: validEmail,
        darkmode: validDarkness
    });

    newUser.save((err) => {
        if (err) {
            if (err.code == 11000)
                return res.status(422).send(err);
            else {
                return res.status(500).send(err);
            }
        } else {
            let newFav = new favTemplate({
                username: req.body.username
            });
            let newFollower = new followers({
                username: req.body.username,
                numOfFollowers: 0,
                followers: []
            });
            let newFollowing = new following({
                username: req.body.username,
                numOfFollowing: 0,
                following: []
            });
            let newNotification = new Notifications({
                username: req.body.username,
                notifications: []
            });
            newNotification.save((err) => {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    newFav.save((err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            newFollower.save((err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    newFollowing.save((err) => {
                                        if (err) {
                                            return res.status(500).json(err);
                                        } else {
                                            return res.status(200).send();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
module.exports.resetPassword = (req, res) => {
    let user = utils.sanitizeUsername(req.username);
    let oldPass = utils.sanitizePassword(req.body.oldPassword);
    let newPass = utils.sanitizePassword(req.body.newPassword);

    if (!user || !oldPass || !newPass) {
        return res.status(400).send("invalid Input.");
    }

    User.findOne({
        username: user
    }, {
        password: 1
    }, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            if (!bcrypt.compareSync(oldPass, result.password)) {
                return res.status(401).send(err);
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        bcrypt.hash(newPass, salt, (err, hash) => {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                User.updateOne({
                                    username: user
                                }, {
                                    $set: {
                                        password: hash,
                                        saltSecret: salt
                                    }
                                }, (err) => {
                                    if (err) {
                                        return res.status(500).send(err);
                                    } else {
                                        return res.status(200).send();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}