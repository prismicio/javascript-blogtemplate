
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    prismic = require('./prismic-helpers');

var app = express();

// Inject interesting libs to use in templates
app.locals.moment = require('moment');
app.locals._ = require('lodash');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

// Routes
app.route('/').get(routes.index);
app.route('/author/:id/:slug').get(routes.author);
app.route('/search').get(routes.search);
app.route('/category/:uid').get(routes.category);
app.route('/tag/:tag').get(routes.thetag);
app.route('/archive/:year').get(routes.archive);
app.route('/archive/:year/:month').get(routes.archive);
app.route('/archive/:year/:month/:day').get(routes.archive);
app.route('/preview').get(routes.preview);
app.route('/feed').get(routes.feed);
app.route('/:year/:month/:day/:uid').get(routes.post);
app.route('/:uid').get(routes.page);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});

module.exports = app;
