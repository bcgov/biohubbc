import { expect } from 'chai';
import { describe } from 'mocha';
import { DatabaseError } from 'pg';
import { ApiError, ApiErrorType } from './api-error';
import { ensureHTTPError, HTTP400, HTTP401, HTTP403, HTTP409, HTTP500, HTTPError } from './http-error';

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

  it('returns a HTTPError when a DatabaseError provided', function () {
    const databaseError = new DatabaseError('a db error message', 1, 'error');

    const ensuredError = ensureHTTPError(databaseError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('Unexpected Database Error');
    expect(ensuredError.errors).to.eql([
      {
        length: 1,
        message: 'a db error message',
        name: 'error'
      }
    ]);
  });

  it('returns a HTTPError when a AJVError object provided', function () {
    const ajvError = { status: 400, errors: [{ instancePath: '/path' }] };

    const ensuredError = ensureHTTPError(ajvError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(400);
    expect(ensuredError.message).to.equal('Request Validation Error');
    expect(ensuredError.errors).to.eql([
      {
        instancePath: '/path'
      }
    ]);
  });

  it('returns a HTTPError when a non Http Error provided', function () {
    const nonHttpError = new Error('a non http error');

    const ensuredError = ensureHTTPError(nonHttpError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('Unexpected Error');
    expect(ensuredError.errors).to.eql([{ message: 'a non http error', name: 'Error' }]);
  });

  it('returns a generic HTTPError when a non Error provided', function () {
    const nonError = 'not an Error';

    const ensuredError = ensureHTTPError(nonError);

    expect(ensuredError).to.be.instanceof(HTTPError);

    expect(ensuredError.status).to.equal(500);
    expect(ensuredError.message).to.equal('Unexpected Error');
    expect(ensuredError.errors).to.eql(['not an Error']);
  });
});
