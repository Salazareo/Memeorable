let Template = require('../models/templates');
let faveTemplate = require('../models/fav_template');
let Post = require('../models/posts');
let User = require('../models/users');
let utils = require('../helpers/utils.js');

module.exports.getPostsFromTemplate = (req, res) => {
    Post.find({
        tID: req.params.tID
    }).sort({
        _id: -1
    }).then((result, err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            let ret = result.slice((req.params.amount - 1) * 12, req.params.amount * 12);
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
                    for (u in users) {
                        links[users[u].username] = users[u].profilePicture;
                    }
                    for (p in ret) {
                        ret[p].profilePicture = links[ret[p].username];
                        ret[p].comments = ret[p].comments.length;
                    }
                    let final = {
                        list: ret,
                        length: result.length
                    };
                    res.status(200).send(final);
                }
            });
        }
    });
}


module.exports.getNewTemplates = (req, res) => {
    faveTemplate.findOne({
        username: req.username
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            Template.find().sort({
                _id: -1
            }).then((templates, err) => {
                if (err) {
                    return res.status(500).send();
                } else {
                    if (!templates.length) {
                        return res.status(404).send(templates);
                    } else {
                        if (!result) {
                            return res.status(200).send(templates
                                .slice(12 * (req.params.amount - 1), 12 * req.params.amount));
                        }
                        let faveFirst = [];
                        let count = 0;
                        for (i in result.fav_templates) {
                            if (count > 12 * req.params.amount) {
                                break;
                            }
                            for (j in templates) {
                                if (result.fav_templates[i] == templates[j]._id) {
                                    let parsed = JSON.parse(JSON.stringify(templates.splice(j, 1)));
                                    faveFirst.push(parsed[0]);
                                    faveFirst[count].fave = true;
                                    count++;
                                    break;
                                }
                            }
                        }
                        let finalRet = (faveFirst.concat(templates))
                            .slice(12 * (req.params.amount - 1), 12 * req.params.amount);
                        return res.status(200).json(finalRet);
                    }
                }
            });
        }
    });
}

module.exports.getFave = (req, res) => {
    faveTemplate.findOne({
        username: req.username
    }, (err, templates) => {
        if (err) {
            return res.status(500).send(err);
        } else {
            return res.status(200).send(templates);
        }
    });
}

module.exports.toggleFave = (req, res) => {
    let validUsername = utils.sanitizeUsername(req.username);
    if (!validUsername) {
        return res.status(400).send('Invalid username.');
    }
    req.username = validUsername;
    faveTemplate.findOne({
        username: req.username
    }, (err, result) => {
        if (err) {
            return res.status(500).send();
        } else {
            result = result.fav_templates;
            if (result.indexOf(req.body.fav_template) >= 0) {
                faveTemplate.updateOne({
                    username: req.username
                }, {
                    $pull: {
                        fav_templates: req.body.fav_template
                    }
                }, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        return res.status(200).send();
                    }
                });
            } else {
                faveTemplate.updateOne({
                    username: req.username
                }, {
                    $push: {
                        fav_templates: req.body.fav_template
                    }
                }, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        return res.status(200).send();
                    }
                });
            }
        }
    });
}



module.exports.postTemplate = (req, res) => {
    let newTemplate = new Template({
        tLink: req.body.tLink,
        tDesc: req.body.tDesc,
        tTags: req.body.tTags,
        username: req.body.username
    });
    newTemplate.save((err, template) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            return res.json(template);
        }
    });
}

module.exports.getTemplateByID = (req, res) => {
    Template.findOne({
        _id: req.params.id
    }, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (!result) {
                return res.status(404).send();
            }
            return res.status(200).json(result);
        }
    });
}

module.exports.deleteTemplate = (req, res) => {
    Template.findOne({
        _id: req.params.id
    }, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (!result) {
                return res.status(404).send();
            } else {
                if (result.username != req.username) {
                    return res.status(403).send();
                } else {
                    Template.deleteOne({
                        _id: req.params.id
                    }, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            faveTemplate.updateMany({}, {
                                $pull: {
                                    fav_templates: req.params.id
                                }
                            }, (err) => {
                                if (err) {
                                    return res.status(500).send(err);
                                } else {
                                    Post.find({
                                        tID: req.params.id
                                    }, (err, result) => {
                                        if (err) {
                                            return res.status(500).send(err);
                                        } else {
                                            let ids = [];
                                            for (i in result) {
                                                ids.push(JSON.stringify(result[i]._id).replace(/"/g, ''));
                                            }
                                            User.updateMany({}, {
                                                $pull: {
                                                    Upvotes: {
                                                        $in: ids
                                                    },
                                                    Downvotes: {
                                                        $in: ids
                                                    }
                                                }
                                            }, (err, res) => {
                                                if (err) {
                                                    return res.status(500).send(err);
                                                }
                                            });

                                            Post.deleteMany({
                                                tID: req.params.id
                                            }, (err) => {
                                                if (err) {
                                                    return res.status(500).send(err)
                                                } else {
                                                    return res.status(200).send();
                                                }
                                            })
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
}


module.exports.updateTemplate = (req, res) => {
    User.findOneAndUpdate({
        _id: req.body._id
    }, {
        $set: req
    }, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (!result) {
                return res.status(404).send();
            }
            return res.status(200).json(result);
        }
    });
}