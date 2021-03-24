const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');
const path = require('path');
const utils = require('../helpers/utils.js');

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      const cleanEmail = utils.sanitizeEmail(req.body.email);
      if (cleanEmail === null) {
        return res.status(400).send('Invalid input.');
      }

      User.findOne({
        email: cleanEmail
      }, function (err, user) {
        if (!user) {
          return res.send(404);
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'lukaszdworako',
          pass: 'fdem9bfF5tSYORIyk8lZ'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@memeorable.xyz',
        subject: 'Memeorable Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/api/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        done(err, 'done');
        res.send(200);
      });
    }
  ], function (err) {
    if (err) return next(err);
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      return res.redirect('/email.html');
    }
    res.sendFile(path.join(__dirname + '/../public/passwordReset.html'));
  });
});

router.get('/user/:token', function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      res.send(500);
    } else {
      res.send({
        user: user.username
      });
    }
  });
});


router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        const cleanPassword = utils.sanitizePassword(req.body.password);
        if (cleanPassword === null) {
          return res.status(400).send('Invalid input.');
        }

        if (!user) {
          return res.redirect('back');
        }

        let response = resetPassword(user.email, cleanPassword);
        if (response == 500) {
          return res.send(500);
        }
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        var smtpTransport = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'lukaszdworako',
            pass: 'fdem9bfF5tSYORIyk8lZ'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@memeorable.xyz',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          done(err, 'done');
        });
      });
    }
  ]);
  res.send(200);
});

function resetPassword(email, password) {
  var hashed;
  var new_salt;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return 500;
      } else {
        User.findOneAndUpdate({
          email: email
        }, {
          $set: {
            password: hash,
            saltSecret: salt,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
          }
        }, (err, result) => {
          if (err) {
            return 500;
          } else {
            return 200;
          }
        });
      }
    });
  });
  return 200;
}



module.exports = router;