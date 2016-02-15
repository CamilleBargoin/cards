var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var database = require('./database.js');
var colors = require('colors');

//
// SESSIONS
//

var session = require('express-session');
var sessionFileStore = require('session-file-store');
var ExpressSessionFileStore = sessionFileStore(session);

var fileStore = new ExpressSessionFileStore({
  ttl:3600,
  path:'./sessions'
});





//
// ROUTES
//
var routes = require('./routes/index');
var users = require('./routes/users');


var app = express();

//
// JADE
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: '1a9b829823448061ed5931380efc6c6a',
  resave: true,
  saveUninitialized: true,
  store: fileStore
}));


// DATABASE
var urlDatabase = 'mongodb://localhost:27017/cards';

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

database.connect(urlDatabase, function(err) {
  if (err) {
    console.log('Impossible de se connecter à la base de données.'.red);
    console.log(err);
    process.exit(1);
  }
  else {
    console.log("Connected correctly to mongo server".green);
    startServer();
  }
});


var startServer = function() {

  console.log("ExpressJS Server Waiting for Client Requests".green);

  app.use(function (req, res, next) {

    console.log(database);
    req.db = database;
    //req.session = session;
    next();
  });


  app.use('/', routes);
  app.use('/users', users);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

};



module.exports = app;
