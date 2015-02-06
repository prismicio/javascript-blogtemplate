
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
    engine = require('ejs-locals'),
    prismic = require('./prismic-helpers');

var app = express();

// all environments
app.engine('ejs', engine);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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
//app.route('/author/:id/:slug').get(routes.author);
//app.route('/search').get(routes.search);
//app.route('/category/:uid').get(routes.category);
//app.route('/tag/:tag').get(routes.tag);
//app.route('/archive/:year/:month/:day').get(routes.archive);
//app.route('/preview').get(routes.preview);
//app.route('/feed').get(routes.feed);
//app.route('/:year/:month/:day/:uid').get(routes.post);
//app.route('/:path').get(routes.page);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});

