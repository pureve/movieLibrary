var mongoose = require('mongoose');

// creates schema for movies
var MovieSchema = new mongoose.Schema({
  name: String,
  releaseDate: Date,
  duration: Number,
  actors: String,
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  addedUserId: String,
  numberRatedUsers: Number,
  comments: [{
    user: String,
    userId: String,
    comment: String,
    rate: Number,
  }]
});


// making a model for movies
var Movie = mongoose.model('Movie', MovieSchema);
// export the model
module.exports = Movie;
