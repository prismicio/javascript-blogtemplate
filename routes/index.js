var helpers = require('../prismic-helpers'),
  Prismic = require('prismic.io').Prismic,
  Q = require('q'),
  _ = require('lodash');

// Submit a Prismic form and get a Q promise

function Q_submit(form) {
  return Q.nbind(form.submit, form)();
}

// Pages helpers

function Q_pages(ctx) {
  return helpers.Q_getDocument(ctx, ctx.api.bookmarks['home']).then(function (home) {
    var pages = home.getGroup('page.children').toArray();
    return Q.all(_.map(pages, function(page) {
      var link = page.getLink('link');
      var childrenP = Q([]);
      if (link instanceof Prismic.Fragments.DocumentLink) {
        childrenP = helpers.Q_getDocument(ctx, link.id).then(function (linkDoc) {
          return linkDoc.getGroup('page.children') ? linkDoc.getGroup('page.children').toArray() : [];
        });
      }
      return childrenP.then(function(children){
        return {
          doc: page,
          children: children
        }
      });
    }));
  })
}

// -- Display all documents

exports.index = helpers.route(function(req, res, ctx) {
  var docs = Q_submit(helpers.form(ctx)
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
    .orderings("[my.post.date desc]"));
  var home = helpers.Q_getDocument(ctx, ctx.api.bookmarks['home']);
  var pages = Q_pages(ctx);

  Q.all([home, pages, docs]).then(function (result) {
    console.log("Pages are : ", result[1]);
    res.render('index', {
      home: result[0],
      pages: result[1],
      docs: result[2]
    });
  }).fail(function (err) {
    helpers.onPrismicError(err, req, res);
  });
});

exports.author = helpers.route(function(req, res, ctx) {
    res.render('todo');
});

// -- Display a given document

exports.post = helpers.route(function(req, res, ctx) {
  var uid = req.params['uid'];

  var doc = Q_submit(helpers.form(ctx)
    .query(Prismic.Predicates.at('my.post.uid', uid))
    .fetchLinks([
      'post.date',
      'category.name',
      'author.full_name',
      'author.first_name',
      'author.surname',
      'author.company'
    ])).then(function(res) {
      return (res && res.results && res.results.length) ? res.results[0] : undefined;
  });
  var home = helpers.Q_getDocument(ctx, ctx.api.bookmarks['home']);
  var pages = Q_pages(ctx);

  Q.all([home, pages, doc]).then(function (result) {
    if (!result[2]) {
      res.send(404, 'Sorry, we cannot find that!');
      return;
    }
    res.render('detail', {
      home: result[0],
      pages: result[1],
      post: result[2]
    });
  }).fail(function (err) {
    helpers.onPrismicError(err, req, res);
  });
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
