var should = require('chai').should(),
  request = require('supertest'),
  app = require('../app');

describe('Integration', function() {

  it('index', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
/*      .end(function(err, res) {
        if (err) return done(err);
        console.log("res", res);
        // res.body.should.have
        done();
      });*/
  });

});
