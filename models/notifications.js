const mongo = require('mongoose');

const NotificationSchema = mongo.Schema({
  username: {
    type: String,
    unique: true
  }, newCount: {
    type: Number,
    default: 0
  },
  notifications: [{
    message: String,
    epoch: number,
    associatedId: String,
    isRead: {
      type: Boolean,
      default: false
    },
    nType: Number
  }]
});
module.exports = mongo.model('Notification', NotificationSchema);