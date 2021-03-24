const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
var User = require('../models/users');
const bcrypt = require('bcryptjs');

passport.use(
    new localStrategy({
            usernameField: 'username'
        },
        (username, password, done) => {
            if (!username || !password) {
                return done(null, false, {
                    message: "Wrong password."
                });
            }
            User.findOne({
                    username: username
                },
                (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    // unknown user
                    else if (!user) {
                        return done(null, false, {
                            message: 'Email is not registered'
                        });
                    }
                    // wrong password
                    else if (!bcrypt.compareSync(password, user.password)) {
                        return done(null, false, {
                            message: 'Wrong password.'
                        });
                    }
                    // authentication succeeded
                    else {
                        return done(null, user);
                    }
                });
        })
);