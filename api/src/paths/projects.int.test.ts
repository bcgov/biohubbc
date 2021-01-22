export {}
const request = require('supertest');


// https://dev-tester.com/dead-simple-api-tests-with-supertest-mocha-and-chai/
// https://medium.com/@akanksha17/getting-started-with-writing-api-tests-in-node-js-96eb2c694cad

// https://openbase.com/js/nock#how-does-it-work
// https://www.npmjs.com/package/supertest

describe('Integration Testing: GET /projects', () => {

  it('should require authorization', function(done) {
    // https://gist.github.com/bq1990/595c615970250e97f3ea
    // Supertest authenticate with bearer token
    request('http://localhost:6100/api')
      .get('/projects')
      .expect(401)
      .end(function(err: any, res: any) {
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

  it('should make a connection to the API', function(done) {
    request('http://localhost:6100/api')
      .get('/api-docs')
      .expect(200)
      .end(function(err: any, res: any) {
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
