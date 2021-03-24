let Post = require('../models/posts');
let User = require('../models/users');
let Notifications = require('../models/notifications');
let utils = require('../helpers/utils.js');

module.exports.deletePost = (req, res) => {
    Post.findOne({
        _id: req.body._id
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            if (result.username != req.username) {
                return res.status(403).send();
            } else {
                Post.deleteOne({
                    _id: req.body._id
                }, (err) => {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).send();
                    }
                });
            }
        }
    });
}

module.exports.getNewPosts = (req, res) => {
    Post.find({
        username: req.params.username
    }).sort({
        _id: -1
    }).then((result, err) => {
        if (err) {
            return res.status(404).send();
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
                    return res.status(500).send();
                } else {
                    let links = {};
                    for (u in users) {
                        links[users[u].username] = users[u].profilePicture;
                    }
                    for (p in ret) {
                        ret[p].profilePicture = links[ret[p].username];
                        ret[p].comments = ret[p].comments.length;
                    }
                    let retval = {
                        list: ret,
                        length: result.length
                    }
                    res.status(200).send(retval)
                }
            });
        }
    });
}

module.exports.postComment = (req, res) => {

    Post.findByIdAndUpdate(req.body.id, {
        $push: {
            "comments": {
                "username": req.username,
                "comment": req.body.comment
            }
        }
    }, {
        upsert: true
    }, (err, result) => {
        if (err) {
            res.status(500).json(err);
        } else {
            let message = req.username + " commented on your post!";
            let date = new Date().toString();
            let newNotification = {
                message: message,
                date: date,
                postId: req.body.id,
                nType: 2
            };
            Notifications.findOneAndUpdate({
                username: result.username
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
                    return res.status(500).json(err);
                } else {
                    return res.status(200).send();
                }
            });
        }
    });
}

module.exports.getComments = (req, res) => {
    Post.findOne({
        _id: req.params.id
    }, (err, post) => {
        if (err) {
            res.status(500).send();
        } else {
            let ret = post.comments.reverse().slice((req.params.amount - 1) * 10, req.params.amount * 10);
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
                    res.status(500).send();
                } else {
                    let links = {};
                    let final = []
                    for (u in users) {
                        links[users[u].username] = users[u].profilePicture;
                    }
                    for (p in ret) {
                        final[p] = JSON.parse(JSON.stringify(ret[p]));
                        (final[p]).profilePicture = links[ret[p].username];
                    }
                    let ret2 = {
                        comments: final,
                        length: post.comments.length
                    };
                    res.status(200).send(ret2);
                }
            });
        }
    });
}

module.exports.searchPostsByTag = (req, res) => {

    let cleanTag = utils.sanitizeText(req.params.pTag);

    let regx = new RegExp('.*' + cleanTag + '.*');
    if (!regx) {
        return res.status(500).send();
    }
    Post.find({
        pTags: regx
    }).sort({
        _id: -1
    }).then((result, err) => {
        if (err) {
            return res.status(404).send();
        } else {
            let ret = result.slice((req.params.amount - 1) * 8, req.params.amount * 8);
            let userstofind = [];
            for (i in ret) {
                ret[i].comments = ret[i].comments.length;
                if (userstofind.indexOf(ret[i].username) == -1) {
                    userstofind.push(ret[i].username);
                }
            }
            User.find({
                username: userstofind
            }, (err, users) => {
                if (err) {
                    return res.status(500).send();
                } else {
                    let links = {};
                    for (u in users) {
                        links[users[u].username] = users[u].profilePicture;
                    }
                    for (p in ret) {
                        ret[p].profilePicture = links[ret[p].username];
                    }
                    let retval = {
                        list: ret,
                        length: result.length
                    }
                    res.status(200).send(retval)
                }
            });
        }
    });
}

module.exports.vote = (req, res) => {
    let pid = req.body.pid;
    let user = req.username;
    let btn = req.body.btn;
    User.findOne({
        username: user
    }, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            let upL = result.Upvotes;
            let downL = result.Downvotes;
            if (btn) {
                if (upL.includes(pid)) {
                    Post.updateOne({
                        _id: pid
                    }, {
                        $inc: {
                            upvotes: -1
                        }
                    }, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            User.updateOne({
                                username: user
                            }, {
                                $pull: {
                                    Upvotes: pid
                                }
                            }, (err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    return res.status(205).send();
                                }
                            });
                        }
                    });
                } else {
                    Post.updateOne({
                        _id: pid
                    }, {
                        $inc: {
                            upvotes: 1
                        }
                    }, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            User.updateOne({
                                username: user
                            }, {
                                $push: {
                                    Upvotes: pid
                                }
                            }, (err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    if (!downL.includes(pid)) {

                                        return res.status(200).send();
                                    } else {
                                        Post.updateOne({
                                            _id: pid
                                        }, {
                                            $inc: {
                                                downvotes: -1
                                            }
                                        }, (err) => {
                                            if (err) {
                                                return res.status(500).send(err);
                                            } else {
                                                User.updateOne({
                                                    username: user
                                                }, {
                                                    $pull: {
                                                        Downvotes: pid
                                                    }
                                                }, (err) => {
                                                    if (err) {
                                                        return res.status(500).send(err);
                                                    } else {
                                                        return res.status(201).send();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            } else {
                if (downL.includes(pid)) {
                    Post.updateOne({
                        _id: pid
                    }, {
                        $inc: {
                            downvotes: -1
                        }
                    }, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            User.updateOne({
                                username: user
                            }, {
                                $pull: {
                                    Downvotes: pid
                                }
                            }, (err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    return res.status(202).send();
                                }
                            });
                        }
                    });
                } else {
                    Post.updateOne({
                        _id: pid
                    }, {
                        $inc: {
                            downvotes: 1
                        }
                    }, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            User.updateOne({
                                username: user
                            }, {
                                $push: {
                                    Downvotes: pid
                                }
                            }, (err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    if (!upL.includes(pid)) {
                                        return res.status(203).send();
                                    } else {
                                        Post.updateOne({
                                            _id: pid
                                        }, {
                                            $inc: {
                                                upvotes: -1
                                            }
                                        }, (err) => {
                                            if (err) {
                                                return res.status(500).send(err);
                                            } else {
                                                User.updateOne({
                                                    username: user
                                                }, {
                                                    $pull: {
                                                        Upvotes: pid
                                                    }
                                                }, (err) => {
                                                    if (err) {
                                                        return res.status(500).send(err);
                                                    } else {
                                                        return res.status(204).send();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });
}
module.exports.getPostById = (req, res) => {
    let id = req.params.id;
    Post.findById(id, {
        comments: 0,
        epoch: 0
    }, (err, post) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            User.findOne({
                username: post.username
            }, {
                profilePicture: 1
            }, (err, user) => {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    post.profilePicture = user.profilePicture;
                    return res.send(post);
                }
            });
        }
    });
}