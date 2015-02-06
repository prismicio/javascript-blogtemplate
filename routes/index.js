var helpers = require('../prismic-helpers'),
  Prismic = require('prismic.io').Prismic;

// -- Display all documents

exports.index = helpers.route(function(req, res, ctx) {
  helpers.form(ctx)
    .page(req.param('page') || '1')
    .query(Prismic.Predicates.at('document.type', 'post'))
    .fetchLinks([
      'post.date',
      'category.name',
      'author.full_name',
      'author.first_name',
      'author.surname',
      'author.company'
    ])
    .orderings("[my.post.date desc]")
    .submit(function (err, docs) {
      if (err) { helpers.onPrismicError(err, req, res); return; }
      res.render('index', {
        docs: docs
      });
    });
});

exports.author = helpers.route(function(req, res, ctx) {
    res.render('todo');
});

// -- Display a given document

exports.post = helpers.route(function(req, res, ctx) {
  var id = req.params['id'],
      slug = req.params['slug'];

  helpers.getDocument(ctx, id, slug,
    function(err, doc) {
      if (err) { helpers.onPrismicError(err, req, res); return; }
      res.render('detail', {
        doc: doc
      });
    },
    function(doc) {
      res.redirect(301, ctx.linkResolver(doc));
    },
    function(NOT_FOUND) {
      res.send(404, 'Sorry, we cannot find that!');
    }
  );
});

// -- Search in documents

exports.search = helpers.route(function(req, res, ctx) {
  var q = req.query['q'];

  if(q) {
    ctx.api.form('everything').set("page", req.param('page') || "1").ref(ctx.ref)
           .query('[[:d = fulltext(document, "' + q + '")]]').submit(function(err, docs) {
      if (err) { helpers.onPrismicError(err, req, res); return; }
      res.render('search', {
        docs: docs,
        url: req.url
      });
    });
  } else {
    res.render('search', {
      docs: null,
      url: req.url
    });
  }

});

// -- Preview documents from the Writing Room

exports.preview = helpers.route(function(req, res, ctx) {
  var token = req.query['token'];

  if (token) {
    ctx.api.previewSession(token, ctx.linkResolver, '/', function(err, url) {
      res.cookie(helpers.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(301, url);
    });
  } else {
    res.send(400, "Missing token from querystring");
  }
});
