var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//var libraryController = require('./controllers/libraryController');

// Connect mongoDB
mongoose.connect('mongodb+srv://pureve:MovieLibrary@cluster0-dlqts.mongodb.net/MovieLibrary?retryWrites=true&w=majority');
var db = mongoose.connection;

// set up template engine
app.set('view engine', 'ejs');
// static files
app.use(express.static('./public'));
// parse incoming requests
app.use(bodyParser.urlencoded({
  extended: false
}));


//use session for tracking login
app.use(session({
  cookie: {
    maxAge: 2 * 60 * 60 * 1000
  },
  secret: 'work hard',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

//include routes
var routes = require('./routes/router');
app.use('/', routes);


// server listens socket: 4000
app.listen(4000);
