const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Notification = require('../models/notifications');
const posts = require('../models/posts');

router.get('/notifications/:username', (req, res, next) => {
  Notification.findOne({
    username: req.params.username
  }, (err, result) => {
    if (err) {
      return res.status(500);
    }
    if (!result) {
      return res.status(404);
    } else {
      if (!result.notifications) {
        return res.status(201);
      }
      result.notifications = result.notifications.reverse();
      return res.json(result);
    }
  });
});
router.get('/notifications', (req, res, next) => {
  Notification.find(function(err, users) {
    res.json(users);
  })
});
//"notifications._id": req.body.nID
router.post('/notifications', (req, res, next) => {
  Notification.findOneAndUpdate({
    username: req.body.username,
    notifications: {$elemMatch: {_id: req.body.nID}}
  }, {
    $set: {
      "notifications.$.isRead": true
    }
  }, {}, (err, result) => {
    if (err) {
      return res.status(500);
    }
    if (!result) {
      return res.status(404);
    } else {
      return res.status(200);
    }
  });
});

router.get('/notificationsAll', (req, res, next) => {
  Notification.find((err, followers) => {
    res.json(followers);
  });
});

router.delete('/notifications/:username', (req, res, next) => {
  Notification.findOneAndUpdate({
    username: req.params.username
  },
  { $set: {notifications: []}}, (err, result) => {
    if(err) {
      res.status(500);
    }
    if (!result) {
      res.status(404);
    } else {
      res.status(200);
    }
    res.send();
  });
});



router.delete('/notifications', (req, res, next) => {
  Notification.findOneAndUpdate({
    username: req.body.username
  },
  { $pull: {notifications: {_id: req.body.nID}} },
  (err, result) => {
    if(err) {
      res.status(500);
    }
    if (!result) {
      res.status(404);
    } else {
      res.status(200);
    }
    res.send();
  });
});
module.exports = router;
