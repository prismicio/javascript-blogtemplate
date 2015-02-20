var should = require('chai').should(),
  express = require('express'),
  request = require('supertest');

var app = require('../app');

describe('Integration', function() {
  this.timeout(5000);

  it('index', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('feed', function(done) {
    request(app)
      .get('/feed')
      .expect(200, done);
  });

  it('detail', function(done) {
    request(app)
      .get('/2014/11/2/second-post')
      .expect(200, done);
  });

  it('archive', function(done) {
    request(app)
      .get('/archive/2014/12')
      .expect(200, done);
  });

  it('author', function(done) {
    request(app)
      .get('/author/VHiMRicAACcAHSaw/erwan')
      .expect(200, done);
  });

  it('category', function(done) {
    request(app)
      .get('/category/work')
      .expect(200, done);
  });

  it('tag', function(done) {
    request(app)
      .get('/tag/lorem')
      .expect(200, done);
  });

});
