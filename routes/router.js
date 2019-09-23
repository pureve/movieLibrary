var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var Movie = require('../models/movies');
var router = express.Router();
var mongoose = require('mongoose');

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var mysort = {
  name: 1
};

// .......... Home page ..........
router.get('/', function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');
  Movie.find({}).sort(mysort).exec(function(err, docs) {
    if (err) res.json(err);
    else {
      res.render('index', {
        logButton: !logged,
        userLogged: logged,
        username: ((logged) ? req.session.username : 'nothing'),
        movies: docs
      });
    }
  });

});

// .......... Sign Up page ..........
router.get('/signup', function(req, res) {
  res.render('signup', {
    logButton: true,
    userLogged: false,
    username: 'nothing'
  });
});

router.post('/signup', urlencodedParser, function(req, res) {
  // checks if the password match with confirm password
  if (req.body.password !== req.body.passwordConf) {
    res.send("Password Dont match");
  }

  //check if user already exists in db
  else {
    User.findOne({
      username: req.body.username
    }).then(function(currentUser) {
      if (currentUser) {
        // already have the user
        res.render('status', {
          logButton: true,
          userLogged: false,
          username: 'nothing',
          status: "Already have the user.",
          instruction: "Please sign in!"
        });
      } else {
        // make a account for new user
        if (req.body.email &&
          req.body.username &&
          req.body.password &&
          req.body.passwordConf) {
          //grabs the data of user from sign-up page
          var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
          }
          //use schema.create to insert data into the db
          User.create(userData, function(err, user) {
            if (err) {
              return next(err)
            } else {
              console.log("Signed Up !");
              return res.render('status', {
                logButton: true,
                userLogged: false,
                username: 'nothing',
                status: "Succesfully signed up!",
                instruction: "Please sign in"
              });
            }
          });
        }
      }
    });
  }
});

// .......... Sign in page ..........
router.get('/signin', function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');
  res.render('signin', {
    logButton: !logged,
    userLogged: logged,
    username: ((logged) ? req.session.username : 'nothing')
  });
});

router.post('/signin', urlencodedParser, function(req, res) {
  // Get the email address and the password from user and check if he can sign in
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        req.session.username = user.username;
        console.log('succesful login :D');
        return res.redirect('/');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET for logout logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


// .......... Add movie page ..........
router.get('/addmovie', function(req, res) {
  if (typeof req.session.userId == 'undefined') {
    res.render('status', {
      logButton: true,
      userLogged: false,
      username: 'nothing',
      status: "You should log-in in order to add a movie in library.",
      instruction: "Please sign in!"
    });
  } else {
    res.render('addmovie', {
      logButton: false,
      userLogged: true,
      username: req.session.username
    });
  }
});

//Add a movie
router.post('/addmovie', urlencodedParser, function(req, res) {
  Movie.findOne({
    name: req.body.movieName
  }).then(function(currentMovie) {
    // Check if the movie already added
    if (currentMovie) {
      res.render('status', {
        logButton: true,
        userLogged: false,
        username: 'nothing',
        status: "Already have this movie.",
        instruction: "Please add different movie!"
      });
    } else {
      // check if all fields filled
      if (req.body.movieName &&
        req.body.duration &&
        req.body.releaseDate &&
        req.body.actors
      ) {
        // grab the information of movie from add-movie page
        console.log(req.body);
        var movieData = {
          name: req.body.movieName,
          releaseDate: req.body.releaseDate,
          duration: req.body.duration,
          actors: req.body.actors,
          rating: 0,
          addedUserId: req.session.userId,
          numberRatedUsers: 0,
          comments: []
        };
        //use schema.create to insert data into the db
        Movie.create(movieData, function(err, movie) {
          if (err) {
            return next(err)
          } else {
            console.log("Movie added !");
            return res.render('status', {
              logButton: false,
              userLogged: true,
              username: req.session.username,
              status: "Succesfully added the Movie!",
              instruction: "Please go to home page"
            });
          }
        });
      }
    }
  });
});

// .......... Sort the table ..........
router.get('/sortByName', function(req, res) {
  // change the value of sorting-variale
  mysort = {
    name: 1
  };
  res.redirect('/');
});

router.get('/sortByNameNeg', function(req, res) {
  mysort = {
    name: -1
  };
  res.redirect('/');
});

router.get('/sortByDate', function(req, res) {
  mysort = {
    releaseDate: -1
  };
  res.redirect('/');
});

router.get('/sortByDateNeg', function(req, res) {
  mysort = {
    releaseDate: 1
  };
  res.redirect('/');
});

router.get('/sortByRating', function(req, res) {
  mysort = {
    rating: 1
  };
  res.redirect('/');
});

router.get('/sortByRatingNeg', function(req, res) {
  mysort = {
    rating: -1
  };
  res.redirect('/');
});

router.get('/sortByDuration', function(req, res) {
  mysort = {
    duration: 1
  };
  res.redirect('/');
});

router.get('/sortByDurationNeg', function(req, res) {
  mysort = {
    duration: -1
  };
  res.redirect('/');
});

router.get('/sortByActors', function(req, res) {
  mysort = {
    actors: 1
  };
  res.redirect('/');
});

router.get('/sortByActorsNeg', function(req, res) {
  mysort = {
    actors: -1
  };
  res.redirect('/');
});

// .......... Movie page ..........
router.get('/more/:movieId', function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');

  Movie.findOne({
    _id: req.params.movieId
  }).then(function(currentMovie) {

    // Calculate the new average rating
    var i = 0;
    var avrgRating = 0;

    if (currentMovie.comments != null) {
      currentMovie.comments.forEach(function(comment) {
        avrgRating += comment.rate;
        i++;
      });

      avrgRating = Math.round(avrgRating / i * 10) / 10;
    }

    // Update old average rating
    currentMovie.rating = avrgRating;
    currentMovie.save(function(err) {
      if (err) console.log(err);
    });

    // Check if the user can edit or remove this movie
    var userEdit = (req.session.userId === currentMovie.addedUserId);

    res.render('movieInfo', {
      logButton: !logged,
      userLogged: logged,
      username: ((logged) ? req.session.username : 'nothing'),
      name: currentMovie.name,
      movieId: currentMovie._id,
      relDate: currentMovie.releaseDate.getFullYear(),
      duration: currentMovie.duration,
      actors: currentMovie.actors,
      rating: avrgRating,
      comments: currentMovie.comments,
      userEdit: userEdit
    });
  });
});

// Add a comment in movie page
router.post('/movieInfo/:movieId', urlencodedParser, function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');
  //if the user is not logged in
  if (!logged) {
    res.render('status', {
      logButton: true,
      userLogged: false,
      username: 'nothing',
      status: "You should sign in to write a comment.",
      instruction: "Please sign in!"
    });
  } else {
    // if the user logged in, the new comment can be added
    var newComment = {
      user: req.session.username,
      userId: req.session.userId,
      comment: req.body.comment,
      rate: req.body.rating
    };
    // check if the has user already written a comment
    Movie.findOne({
      "_id": req.params.movieId,
      "comments.user": req.session.username
    }).then(function(movie) {
      // if already written
      if (movie) {
        res.redirect('/deletecomment/' + req.params.movieId);
      } else {
        // if not, the new comment will be added
        Movie.update({
          _id: req.params.movieId
        }, {
          $push: {
            comments: newComment
          }
        }, function(err, raw) {
          if (err) {
            res.send(err);
          }
          res.redirect('/more/' + req.params.movieId);
        });
      }
    });
  }
});

// .......... Delete comment page ..........
router.get('/deletecomment/:movieId', function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');

  Movie.findOne({
    _id: req.params.movieId,
    "comments.user": req.session.username
  }).then(function(movie) {
    var movieId = req.params.movieId;
    var movieName = movie.name;
    res.render('deletecomment', {
      movieId: movieId,
      movieName: movieName,
      logButton: !logged,
      userLogged: logged,
      username: ((logged) ? req.session.username : 'nothing')
    });
  });
});

// Deleting the comment
router.get('/delete/:movieId/:userName', function(req, res) {
  Movie.findByIdAndUpdate(
    req.params.movieId, {
      $pull: {
        'comments': {
          user: req.params.userName
        }
      }
    },
    function(err, model) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      return res.redirect('/more/' + req.params.movieId);
    });
});
// .......... Delete Movie ..........
router.get('/delete/:movieId', function(req, res) {
  Movie.findByIdAndRemove(req.params.movieId, function(err, offer) {
    res.redirect('/');
  });
});

// .......... Edit Movie ..........
router.get('/edit/:movieId', function(req, res) {
  var logged = !(typeof req.session.userId == 'undefined');
  // find the movie using the ID-number and sends the data to the "editmovie" page
  Movie.findOne({
    _id: req.params.movieId
  }).then(function(movie) {

    res.render('editmovie', {
      name: movie.name,
      movieId: req.params.movieId,
      date: movie.releaseDate.toISOString().split('T')[0],
      duration: movie.duration,
      actors: movie.actors,
      logButton: !logged,
      userLogged: logged,
      username: ((logged) ? req.session.username : 'nothing')
    });
  });
});

router.post('/edit/:movieId', function(req, res) {
  // the entered data is used for changing information of the movie
  Movie.update({
    _id: req.params.movieId
  }, {
    '$set': {
      name: req.body.movieName,
      duration: req.body.duration,
      releaseDate: req.body.releaseDate,
      actors: req.body.actors
    }
  }, function(err, model) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    return res.redirect('/more/' + req.params.movieId);
  });
});
module.exports = router;
