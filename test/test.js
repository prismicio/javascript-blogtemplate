var should = require('chai').should(),
  express = require('express'),
  request = require('supertest');

var app = require('../app');

describe('Integration', function() {
  this.timeout(5000);

  it('index', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('detail', function(done) {
    request(app)
      .get('/2014/11/2/second-post')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('archive', function(done) {
    request(app)
      .get('/archive/2014/12')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('author', function(done) {
    request(app)
      .get('/author/VHiMRicAACcAHSaw/erwan')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

});
