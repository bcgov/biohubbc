import { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import { HTTP401 } from '../../errors/CustomError';
import * as authentication from './authentication';

describe('authenticate', function () {
  it('throws HTTP401 when authorization headers were null or missing', async function () {
    try {
      await authentication.authenticate(undefined as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await authentication.authenticate({});
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await authentication.authenticate({
        headers: {}
      } as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }
  });

  it('throws HTTP401 when authorization header contains an invalid bearer token', async function () {
    try {
      await authentication.authenticate({
        headers: {
          authorization: 'Not a bearer token'
        }
      } as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await authentication.authenticate({
        headers: {
          authorization: 'Bearer '
        }
      } as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await authentication.authenticate({
        headers: {
          authorization: 'Bearer not-encoded'
        }
      } as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await authentication.authenticate({
        headers: {
          // sample encoded json web token from jwt.io (without kid header)
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        }
      } as unknown as Request);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }
  });
});
