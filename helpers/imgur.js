var imgur = require('imgur');

let Template = require('../models/templates');
let post = require('../models/posts');
let User = require('../models/users');


function uploadImage(req, res) {

  imgur.setClientId('teeheeXD');
  imgur.setAPIUrl('https://api.imgur.com/3/');
  imgur.uploadBase64(req.body.file.replace(/data\:image\/(tiff|gif|jpe?g|a?png)\;base64\,/, "")).then((json) => {
    if (req.body.pTags) {
      var array = req.body.pTags.split(',');
      for (i in array) {
        if (!array[i].trim()) {
          array.splice(i, 1);
        }
      }
    } else if (req.body.tTags) {
      var array = req.body.tTags.split(',');
      for (i in array) {
        if (!array[i].trim()) {
          array.splice(i, 1);
        }
      }
    }
    //alert(array);
    if (req.body.database == 'profilePicture') {
      User.findOneAndUpdate({
        username: req.body.username
      }, {
        $set: {
          profilePicture: json.data.link
        }
      }, (err, result) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.json(result);
        }
      });
    } else if (req.body.database == 'posts') {
      let newPost = new post({
        pLink: json.data.link,
        pTags: array,
        upvotes: 0,
        downvotes: 0,
        username: req.body.username,
        epoch: (new Date).getTime(),
        tID: req.body.tID
      });
      newPost.save((err, post) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.status(200).send(json.data.link);
        }
      });
    } else {
      let newTemplate = new Template({
        tLink: json.data.link,
        tDesc: req.body.tDesc,
        tTags: array,
        username: req.body.username
      });
      newTemplate.save((err, template) => {
        if (err) {
          res.status(500).json(err);
        } else {
          //console.log(template);
          res.status(200).send({
            _id: template["_id"],
            ImgLink: json.data.link
          });
        }
      });
    }
  });
}
module.exports.uploadImage = uploadImage;
