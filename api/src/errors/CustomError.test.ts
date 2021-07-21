import { expect } from 'chai';
import { describe } from 'mocha';
import { CustomError, ensureCustomError, HTTP400, HTTP401, HTTP403, HTTP409, HTTP500 } from './CustomError';

describe('CustomError', () => {
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

describe('ensureCustomError', () => {
  it('returns the original CustomError when a CustomError provided', function () {
    const customError = new HTTP400('a custom error');

    const ensuredError = ensureCustomError(customError);

    expect(ensuredError).to.be.instanceof(CustomError);

    expect(ensuredError).to.deep.equal(customError);
  });

  it('returns a CustomError when a non custom Error provided', function () {
    const nonCustomError = new Error('a non custom error');

    const ensuredError = ensureCustomError(nonCustomError);

    expect(ensuredError).to.be.instanceof(CustomError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('a non custom error');
  });
});
