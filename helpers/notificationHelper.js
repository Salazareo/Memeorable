const Notifications = require('../models/notifications');
const typeMessages = {
    0: "associatedId started following you!",
    1: "otherActorId commented on one of your posts!",
    2: "otherActorId liked (or disliked) one of your posts!"
}
/**
 * 
 * @param {number} type 0 for follow, 1 for comment, 2 for like
 * @param {string} username 
 * @param {string} associatedId 
 * @param {string | null} otherActorId 
 * @param {function} callBack
 */
let addNotification = (type, username, associatedId, otherActorId = null, callBack) => {
    let newNotification = {
        nType: type,
        message: typeMessages[type].replace(otherActorId ? otherActorId : associatedId),
        epoch: Date.now(),
        isRead: false,
        associatedId: associatedId
    }
    Notifications.updateOne({
        username: username
    }, {
        $push: {
            notifications: newNotification
        },
        $inc: {
            newCount: +1
        }
    }, callBack);
}
module.exports.addNotification = addNotification;

let markRead = (notifId, callBack) => {
    Notifications.updateOne({ _id: notifId }, {
        $set: {
            isRead: true
        },
        $inc: {
            newCount: -1
        }
    }, callBack);
}
module.exports.markRead = markRead;

let deleteNotification = (notifId, callBack) => {
    Notifications.deleteOne({
        _id: notifId
    }, callBack);
}