import { expect } from 'chai';
//import request = require('supertest');
import { _extractProjects } from './projects';

// const API_HOST = process.env.REACT_APP_API_HOST;
// const API_PORT = process.env.REACT_APP_API_PORT;

// const API_URL = (API_PORT && `${API_HOST}:${API_PORT}`) || API_HOST || 'https://api-dev-biohubbc.apps.silver.devops.gov.bc.ca';
// const KEYCLOAK_URL =
//   process.env.KEYCLOAK_URL || 'https://dev.oidc.gov.bc.ca/auth/realms/35r1iman/protocol/openid-connect/certs';

describe('Unit Testing: GET /projects - Test database query result parsing', () => {
  it('should return empty array if query result was empty', function () {
    const rows: any[] = [];
    const projects: any[] = _extractProjects(rows);

    expect(projects).to.be.an('array');
    expect(projects).to.have.length(0);
  });

  it('should return an array of one element if query result contains one row', function () {
    const rows: any[] = [];

    rows.push({
      id: 1,
      name: 'Project BioHub',
      start_date: '2021/01/01',
      end_date: '2022/12/31',
      location_description: 'Here'
    });

    const projects: any[] = _extractProjects(rows);

    expect(projects).to.be.an('array');
    expect(projects).to.have.length(1);
    expect(projects[0]).to.have.property('name', 'Project BioHub');
  });
});

// TODO: Come back to do integration test.

// describe('Integration Testing: GET /projects', () => {
//   it('should require authorization', function (done) {
//     request(API_URL)
//       .get('/api/projects')
//       .expect(401)
//       .end(function (err: any) {
//         if (err) return done(err);
//         done();
//       });
//   });
//   it('should make a connection to the API', function (done) {
//     request(API_URL)
//       .get('/api/api-docs')
//       .expect(200)
//       .end(function (err: any) {
//         if (err) return done(err);
//         done();
//       });
//   });
//   var auth: any = {};
//   before(loginUser(auth));
//   it('should respond with JSON array', function (done: any) {
//     request(API_URL)
//       .get('/api/projects')
//       .set('Authorization', 'bearer ' + auth.token)
//       .expect(401)
//       .expect('Content-Type', /json/)
//       .end(function(err: any, res: any) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
// function loginUser(auth: any) {
//   return function(done: any) {
//       request(KEYCLOAK_URL)
//           .post('/protocol/openid-connect/certs')
//           .send({
//               email: 'test@test.com',
//               password: 'test'
//           })
//           .expect(200)
//           .end(onResponse);

//       function onResponse(err: any, res: any) {
//           auth.token = res.body.token;
//           return done();
//       }
//   };
// };
