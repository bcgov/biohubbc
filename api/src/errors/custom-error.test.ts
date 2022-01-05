import { expect } from 'chai';
import { describe } from 'mocha';
import {
  ApiError,
  ApiErrorType,
  ensureHTTPError,
  HTTP400,
  HTTP401,
  HTTP403,
  HTTP409,
  HTTP500,
  HTTPError
} from './custom-error';

describe('HTTPError', () => {
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

describe('ensureHTTPError', () => {
  it('returns the original HTTPError when a HTTPError provided', function () {
    const httpError = new HTTP400('a http error');

    const ensuredError = ensureHTTPError(httpError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError).to.deep.equal(httpError);
  });

  it('returns a HTTPError when an ApiError provided', function () {
    const apiError = new ApiError(ApiErrorType.UNKNOWN, 'an api error message');

    const ensuredError = ensureHTTPError(apiError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('an api error message');
  });

  it('returns a HTTPError when a non Http Error provided', function () {
    const nonHttpError = new Error('a non http error');

    const ensuredError = ensureHTTPError(nonHttpError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('a non http error');
  });
});
