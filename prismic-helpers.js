var Prismic = require('prismic.io').Prismic,
    Configuration = require('./prismic-configuration').Configuration,
    http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring'),
    _ = require('lodash'),
    moment = require('moment'),
    Q = require('q');

exports.previewCookie = Prismic.previewCookie;

// -- Helpers

function Q_submit(form) {
  return Q.nbind(form.submit, form)();
}

exports.form = function(ctx) {
  return ctx.api.forms('everything').ref(ctx.ref);
};

exports.getApiHome = function(accessToken, callback) {
  Prismic.Api(Configuration.apiEndpoint, callback, accessToken);
};

exports.Q_getDocument = function(ctx, id) {
  return Q_submit(ctx.api.forms('everything').ref(ctx.ref).query(Prismic.Predicates.at('document.id', id))).then(function(res){
    return (res && res.results && res.results.length) ? res.results[0] : undefined;
  });
};

exports.Q_getAllPosts = function(ctx, posts, page) {
  posts = posts || [];
  page = page || 1;
  console.log("Q_getAllPosts with page ", page);
  return Q_submit(ctx.api.forms('everything')
    .ref(ctx.ref)
    .page(page)
    .query(Prismic.Predicates.at('document.type', 'post'))
    .orderings('[my.post.date desc]'))
    .then(function(response) {
      if (response.next_page) {
        return exports.Q_getAllPosts(ctx, posts.concat(response.results), page + 1);
      } else {
        return posts.concat(response.results);
      }
    });
};

exports.Q_getCalendar = function(ctx) {
  return exports.Q_getAllPosts(ctx).then(function(posts){
    return _(posts)
      .reject(function(post) {
        !post.getDate("post.date");
      })
      .map(function(post) {
        var date = post.getDate("post.date");
        return {
          'label': moment(date).format("MMMM YYYY"),
          'link': 'archives/' + moment(date).format("YYYY/MM")
        }
    }).uniq('label').value();
  });
};

exports.getDocument = function(ctx, id, slug, onSuccess, onNewSlug, onNotFound) {
  ctx.api.forms('everything').ref(ctx.ref).query('[[:d = at(document.id, "' + id + '")]]').submit(function(err, documents) {
    var results = documents.results;
    var doc = results && results.length ? results[0] : undefined;
    if (err) onSuccess(err);
    else if(doc && (!slug || doc.slug == slug)) onSuccess(null, doc);
    else if(doc && doc.slugs.indexOf(slug) > -1 && onNewSlug) onNewSlug(doc);
    else if(onNotFound) onNotFound();
    else onSuccess();
  });
};

exports.getDocuments = function(ctx, ids, callback) {
  if(ids && ids.length) {
    ctx.api.forms('everything').ref(ctx.ref).query('[[:d = any(document.id, [' + ids.map(function(id) { return '"' + id + '"';}).join(',') + '])]]').submit(function(err, documents) {
      callback(err, documents.results);
    });
  } else {
    callback(null, []);
  }
};

exports.getBookmark = function(ctx, bookmark, callback) {
  var id = ctx.api.bookmarks[bookmark];
  if(id) {
    exports.getDocument(ctx, id, undefined, callback);
  } else {
    callback();
  }
};

// -- Exposing as a helper what to do in the event of an error (please edit prismic-configuration.js to change this)
exports.onPrismicError = Configuration.onPrismicError;

// -- Route wrapper that provide a "prismic context" to the underlying function

exports.route = function(callback) {
  return function(req, res) {
    var accessToken = (req.session && req.session['ACCESS_TOKEN']) || Configuration.accessToken || undefined;
    exports.getApiHome(accessToken, function(err, Api) {
      if (err) { exports.onPrismicError(err, req, res); return; }
      var ref = req.query['ref'] || Api.master(),
          ctx = {
            api: Api,
            ref: req.cookies[Prismic.experimentCookie] || req.cookies[Prismic.previewCookie] || Api.master(),

            linkResolver: function(link) {
              if (!link) {
                return "";
              }
              if (link.id == Api.bookmarks['home']) return '/';
              if (link.type == "author") {
                return "/author/" + link.id + '/' + link.slug;
              }
              if (link.type == "category") {
                return "/category/" + link.uid;
              }
              if (link.type == "post") {
                var date = link.getDate("post.date");
                return "/" + date.getFullYear() + '/' + date.getMonth() + '/' + date.getDay() + '/' + link.uid;
              }
              if (link.type == "page") {
                return '/' + link.uid;
              }
            }
          };
      res.locals.ctx = ctx;
      exports.Q_getCalendar(ctx).then(function(calendar){
        res.locals.calendar = calendar;
        callback(req, res, ctx);
      });
    });
  };
};


