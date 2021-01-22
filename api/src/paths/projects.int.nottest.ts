export {};
import request = require('supertest');

describe('Integration Testing: GET /projects', () => {
  it('should require authorization', function (done) {
    request('http://localhost:6100/api')
      .get('/projects')
      .expect(401)
      .end(function (err: any) {
        if (err) return done(err);
        done();
      });
  });

  // test api with authentication
  // commented out for now
  /*   var auth: any = {};
  before(loginUser(auth));

  it('should respond with JSON array', function (done: any) {
    request('http://localhost:6100/api')
      .get('/projects')
      .set('Authorization', 'bearer ' + auth.token)
      .expect(401)
      .expect('Content-Type', /json/)
      .end(function(err: any, res: any) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  }); */

  it('should make a connection to the API', function (done) {
    request('http://localhost:6100/api')
      .get('/api-docs')
      .expect(200)
      .end(function (err: any) {
        if (err) return done(err);
        done();
      });
  });
});

/* function loginUser(auth: any) {
  return function(done: any) {
      request('https://dev.oidc.gov.bc.ca/auth/realms/35r1iman')
          .post('/protocol/openid-connect/certs')
          .send({
              email: 'test@test.com',
              password: 'test'
          })
          .expect(200)
          .end(onResponse);

      function onResponse(err: any, res: any) {
          auth.token = res.body.token;
          return done();
      }
  };
} */
