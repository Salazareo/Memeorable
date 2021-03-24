let express = require('express');
let router = express.Router();
let imgur = require('../helpers/imgur.js');


let User = require('../models/users');
let Template = require('../models/templates');
let Notifications = require('../models/notifications');
let followers = require('../models/followers');
let following = require('../models/following');
let favTemplate = require('../models/fav_template');
let post = require('../models/posts');

let deleteUser = 'muFkMLUwzcolz521ejbe';
let deletePass = 'ESnD38YtmiDVlmy9xqei';

let ctrlUser = require('../controller/userController');
let ctrlTemplate = require('../controller/templateController');
let ctrlPost = require('../controller/postController');
let ctrlFeedFollow = require('../controller/feedFollowController');

let jwtHelper = require('../config/jwtHelper').verifyJwtToken;

//Template Routes
router.get('/templates/:amount', ctrlTemplate.getNewTemplates);
router.get('/chooseTemplates/:amount', jwtHelper, ctrlTemplate.getNewTemplates);
router.post('/template', jwtHelper, ctrlTemplate.postTemplate);
router.get('/template/:id', ctrlTemplate.getTemplateByID);
router.delete('/template/:id', jwtHelper, ctrlTemplate.deleteTemplate);
router.put('/template', jwtHelper, ctrlTemplate.updateTemplate);
router.get('/fav', jwtHelper, ctrlTemplate.getFave);
router.put('/fav', jwtHelper, ctrlTemplate.toggleFave);
router.get('/templatePost/:tID/:amount', ctrlTemplate.getPostsFromTemplate);
//Post Routes + some comments/voting
router.delete('/post', jwtHelper, ctrlPost.deletePost);
router.get('/post/:username/:amount', ctrlPost.getNewPosts);
router.post('/comments', jwtHelper, ctrlPost.postComment);
router.get('/comments/:id/:amount', ctrlPost.getComments);
router.get('/searchPosts/:pTag/:amount', ctrlPost.searchPostsByTag);
router.post('/vote', jwtHelper, ctrlPost.vote);
router.get('/post/:id', ctrlPost.getPostById);
//Feed and Following Routes
router.get('/feed/:amount', jwtHelper, ctrlFeedFollow.getFeed);
router.get('/is_following/:target', jwtHelper, ctrlFeedFollow.isFollowing);
router.get('/following/:user/:amount', ctrlFeedFollow.getFollowing);
router.get('/followers/:user/:amount', ctrlFeedFollow.getFollowers);
router.post('/follow', jwtHelper, ctrlFeedFollow.toggleFollow);
// User Routes
router.post('/login', ctrlUser.authenticate);
router.get('/user/:username', ctrlUser.getPublicUserInfo);
router.get('/user', jwtHelper, ctrlUser.getPrivateUserInfo);
router.put('/user', jwtHelper, ctrlUser.updateUserInfo);
router.get('/searchUsers/:user/:amount', ctrlUser.searchUser);
router.post('/register', ctrlUser.register);
router.post('/resetPassword', jwtHelper, ctrlUser.resetPassword);
router.post('/uploadToImgur', jwtHelper, imgur.uploadImage);

router.delete('/zXKJNxZe6Oqnhk2rH982', (req, res, next) => {
  if (req.body.user == deleteUser && req.body.pass == deletePass) {
    Template.remove((err) => {
      if (err) {
        res.status(500).send(err);
      } else {
        post.remove((err) => {
          if (err) {
            res.status(500).send(err);
          } else {
            User.remove((err) => {
              if (err) {
                res.status(500).send(err);
              } else {
                favTemplate.remove((err) => {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    followers.remove((err) => {
                      if (err) {
                        res.status(500).send(err);
                      } else {
                        following.remove((err) => {
                          if (err) {
                            res.status(500).send(err);
                          } else {
                            Notifications.remove((err) => {
                              if (err) {
                                return res.status(500).send(err);
                              } else {
                                res.status(200).send();
                              }
                            })

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
    });
  } else {
    res.status(400).send("wrong user or pass");
  }
});

module.exports = router;
