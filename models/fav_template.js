const mongo = require('mongoose');

const FavSchema = mongo.Schema({
  username: {
    type: String,
    unique: true
  },
  fav_templates: [String]
});


module.exports = mongo.model('Fav', FavSchema);