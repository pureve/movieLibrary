var mongoose = require('mongoose');

// creates schema for user
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordConf: {
    type: String,
    required: true,
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({
      email: email
    })
    .exec(function(err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }

      if (password === user.password) {
        console.log('Correct Input!');
        return callback(null, user);

      } else {
        return callback(Error('Password incorrect'));
      }

    });
}



// making a model for user
var User = mongoose.model('User', UserSchema);
// export the model
module.exports = User;
