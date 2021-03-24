let Following = require('../models/following');
let Followers = require('../models/followers');
let Post = require('../models/posts');
let User = require('../models/users');
let Notifications = require('../models/notifications');

module.exports.getFeed = (req, res) => {
    Following.findOne({
        username: req.username
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            if (!result) {
                return res.status(404).send();;
            }
            let parsed = result.following;
            parsed.push(req.username);
            User.findOne({
                username: req.username
            }, {
                followedTags: 1,
                username: 1
            }, (err, user) => {
                if (err) {
                    return res.status(500).send(err);
                }
                Post.find({
                    username: parsed
                }, {
                    pLink: 1,
                    pTags: 1,
                    username: 1,
                    tID: 1,
                    upvotes: 1,
                    downvotes: 1,
                    comments: 1,
                    epoch: 1
                }).sort({
                    epoch: -1
                }).then((result, err) => {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        let ret = result.slice((req.params.amount - 1) * 6, req.params.amount * 6);
                        let userstofind = [];
                        for (i in ret) {
                            if (userstofind.indexOf(ret[i].username) == -1) {
                                userstofind.push(ret[i].username);
                            }
                        }
                        User.find({
                            username: userstofind
                        }, (err, users) => {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                let links = {};
                                for (u in users) {
                                    links[users[u].username] = users[u].profilePicture;
                                }
                                let final = [];
                                for (p in ret) {
                                    ret[p].profilePicture = links[ret[p].username];
                                    final[p] = JSON.parse(JSON.stringify(ret[p]));
                                    final[p].comments = ret[p].comments.length;
                                }
                                let finalRes = {
                                    list: final,
                                    length: 0
                                }
                                return res.status(200).send(finalRes);
                            }
                        });
                    }
                });
            });
        }
    });
}

module.exports.isFollowing = (req, res) => {
    Following.findOne({
        username: req.username
    }, (err, result) => {
        if (err) {
            res.status(500).send();
        } else {
            if (result) {
                if (result.following.indexOf(req.params.target) >= 0) {
                    res.status(200).send();
                } else {
                    res.status(201).send();
                }
            } else {
                return res.status(404).send();
            }
        }
    });
}

module.exports.getFollowing = (req, res) => {
    Following.findOne({
        username: req.params.user
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            if (!result) {
                return res.status(404).send();
            }
            let ret = result.following.slice(8 * (req.params.amount - 1), 8 * req.params.amount)
            User.find({
                username: ret
            }, {
                username: 1,
                profilePicture: 1
            }, (err, users) => {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    let final = []
                    for (var i in users) {
                        final[i] = {
                            username: users[i].username,
                            img: users[i].profilePicture
                        };
                    }
                    let response = {
                        list: final,
                        amount: result.following.length ? result.following.length : 0
                    };
                    return res.status(200).send(response);
                }
            });
        }
    });
}

module.exports.getFollowers = (req, res) => {
    Followers.findOne({
        username: req.params.user
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            if (!result) {
                return res.status(404).send();
            }
            let ret = result.followers.slice(8 * (req.params.amount - 1), 8 * req.params.amount)
            User.find({
                username: ret
            }, {
                username: 1,
                profilePicture: 1
            }, (err, users) => {
                if (err) {
                    return res.status(500).send();
                } else {
                    let final = [];
                    for (var i in users) {
                        final[i] = {
                            username: users[i].username,
                            img: users[i].profilePicture
                        };
                    }
                    let response = {
                        list: final,
                        amount: result.followers.length ? result.followers.length : 0
                    };
                    return res.status(200).send(response);
                }
            });
        }
    });
}

module.exports.toggleFollow = (req, res, next) => {
    Following.findOne({
        username: req.username
    }, (err, follow) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            if (follow.following.indexOf(req.body.toFollow) >= 0) {
                Following.updateOne({
                    username: req.username
                }, {
                    $pull: {
                        following: req.body.toFollow
                    }
                }, (err) => {
                    if (err) {
                        return res.status(500).send();
                    } else {
                        Followers.updateOne({
                            username: req.body.toFollow
                        }, {
                            $pull: {
                                followers: req.username
                            }
                        }, (err) => {
                            if (err) {
                                return res.status(500).send();
                            } else {
                                return res.status(201).send();
                            }
                        });
                    }
                });
            } else {
                Following.updateOne({
                    username: req.username
                }, {
                    $push: {
                        following: req.body.toFollow
                    }
                }, (err) => {
                    if (err) {
                        return res.status(500).send();
                    } else {
                        Followers.updateOne({
                            username: req.body.toFollow
                        }, {
                            $push: {
                                followers: req.username
                            }
                        }, (err) => {
                            if (err) {
                                return res.status(500).send();
                            } else {
                                let message = req.username + " started following you!";
                                let date = new Date().toString();
                                let newNotification = {
                                    message: message,
                                    date: date,
                                    nType: 1
                                };
                                Notifications.findOneAndUpdate({
                                    username: req.body.toFollow
                                }, {
                                    $push: {
                                        "notifications": newNotification
                                    }
                                }, {
                                    upsert: true,
                                    new: true,
                                    setDefaultsOnInsert: true
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