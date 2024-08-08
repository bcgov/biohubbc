import { expect } from 'chai';
import request from 'supertest';
import { ensureProtocol } from '../utils/http-utils';

describe('GET /version', () => {
  let api = '';

  before(() => {
    api = ensureProtocol(`${process.env.API_HOST}:${process.env.API_PORT}/api`);
  });

  it('should return 200 OK', async () => {
    // Call endpoint
    const response = await request(api).get('/version').set('Accept', 'application/json');

    // Validate response
    expect(response.status).to.equal(200);
    expect('Content-Type', 'application/json');
    expect(response.body).to.eql({
      environment: process.env.NODE_ENV,
      timezone: process.env.API_TZ
    });
  });
});
