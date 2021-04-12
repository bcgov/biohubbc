import { expect } from 'chai';
import { describe } from 'mocha';
import { HTTP400, HTTP401, HTTP403, HTTP409, HTTP500 } from './CustomError';

describe('PostProjectData', () => {
  describe('No error value provided', () => {
    let message: string;

    before(() => {
      message = 'response message';
    });

    it('sets status code 400', function () {
      expect(new HTTP400(message).status).to.equal(400);
    });

    it('sets status code 401', function () {
      expect(new HTTP401(message).status).to.equal(401);
    });

    it('sets status code 403', function () {
      expect(new HTTP403(message).status).to.equal(403);
    });

    it('sets status code 409', function () {
      expect(new HTTP409(message).status).to.equal(409);
    });

    it('sets status code 500', function () {
      expect(new HTTP500(message).status).to.equal(500);
    });
  });
});
