import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as auth_utils from './auth-utils';
import * as db from '../database/db';
import * as user_queries from '../queries/users/user-queries';
import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';
import { HTTP401, HTTP403 } from '../errors/CustomError';

chai.use(sinonChai);

describe('userHasValidSystemRoles', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});

describe('getSystemUser', function () {
  afterEach(() => {
    sinon.restore();
  });

  const keycloakToken = {
    key: 'value'
  };

  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

  it('should return null when no system user id', async function () {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const result = await auth_utils.getSystemUser(keycloakToken);

    expect(result).to.be.null;
  });

  it('should return null when getUserByIdSql fails', async function () {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(null);

    const result = await auth_utils.getSystemUser(keycloakToken);

    expect(result).to.be.null;
  });

  it('should return the user row on success', async function () {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rowCount: 1,
          rows: [
            {
              id: 1,
              user_identifier: 'identifier',
              role_ids: [1, 2],
              role_names: ['role 1', 'role 2']
            }
          ]
        } as QueryResult<any>;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    const result = await auth_utils.getSystemUser(keycloakToken);

    expect(result.id).to.equal(1);
    expect(result.user_identifier).to.equal('identifier');
    expect(result.role_ids).to.eql([1, 2]);
    expect(result.role_names).to.eql(['role 1', 'role 2']);
  });

  it('should return null when response has no rowCount (no user found)', async function () {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return ({
          rowCount: 0,
          rows: []
        } as unknown) as QueryResult<any>;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    const result = await auth_utils.getSystemUser(keycloakToken);

    expect(result).to.be.null;
  });

  it('should throw an error when a failure occurs', async function () {
    const expectedError = new Error('cannot process query');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        throw expectedError;
      }
    });

    try {
      await auth_utils.getSystemUser(keycloakToken);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal(expectedError.message);
    }
  });
});

describe('authorize', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws HTTP403 when the keycloak_token is empty', async function () {
    try {
      await auth_utils.authorize({ keycloak_token: '' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }

    try {
      await auth_utils.authorize(undefined, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('returns true without scopes', async function () {
    const result = await auth_utils.authorize({ keycloak_token: 'some token' }, []);
    expect(result).to.be.true;
  });

  it('throws HTTP403 when stubbed getSystemUser returns null', async function () {
    sinon.stub(auth_utils, 'getSystemUser').resolves(null);

    try {
      await auth_utils.authorize({ keycloak_token: 'some token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('throws HTTP403 when stubbed getSystemUser throws error', async function () {
    sinon.stub(auth_utils, 'getSystemUser').callsFake(async function (keycloak_token: object) {
      if (!keycloak_token || keycloak_token) {
        throw new Error();
      }
    });

    try {
      await auth_utils.authorize({ keycloak_token: 'any token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('throws HTTP403 when stubbed getSystemUser returns user with no roles', async function () {
    sinon.stub(auth_utils, 'getSystemUser').resolves({
      id: 0,
      user_identifier: 'somebody',
      role_ids: [],
      role_names: []
    });
    sinon.stub(auth_utils, 'userHasValidSystemRoles').returns(false);

    try {
      await auth_utils.authorize({ keycloak_token: 'any token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('authorizes a user with valid roles', async function () {
    sinon.stub(auth_utils, 'getSystemUser').resolves({
      id: 0,
      user_identifier: 'somebody',
      role_ids: [],
      role_names: []
    });

    try {
      const result = await auth_utils.authorize({ keycloak_token: 'any token' }, ['abc']);
      expect(result).to.be.true;
    } catch {
      expect.fail();
    }
  });
});

describe('authenticate', function () {
  it('throws HTTP401 when authorization headers were null or missing', async function () {
    try {
      await auth_utils.authenticate(undefined);
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({});
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({
        headers: {}
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }
  });

  it('throws HTTP401 when authorization header containing valid bearer token', async function () {
    try {
      await auth_utils.authenticate({
        headers: {
          authorization: 'Not a bearer token'
        }
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({
        headers: {
          authorization: 'Bearer '
        }
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({
        headers: {
          authorization: 'Bearer not-encoded'
        }
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({
        headers: {
          // sample encoded json web token from jwt.io (without kid header)
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        }
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }

    try {
      await auth_utils.authenticate({
        headers: {
          // sample encoded json web token from jwt.io (with kid header)
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNvbWUgaWQifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.rXYCCTRmi7EAHVRy1QqHvysMxLZaH4EsI226hrJLtgM'
        }
      });
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP401);
    }
  });

  //TODO:  figure out how to stub the callback parameter of the function

  // import * as jsonwebtoken from 'jsonwebtoken';
  // it('returns a validated token through verifyToken', async function () {
  //   sinon
  //     .stub(jsonwebtoken, 'verify')
  //     .withArgs(
  //       'token',
  //       'secretOrPublicKey'
  //       // ,'callback'
  //       )
  //     .callsFake(function (
  //       token: string,
  //       secretOrPublicKey: jsonwebtoken.Secret | jsonwebtoken.GetPublicKeyOrSecret,
  //       // callback?: jsonwebtoken.VerifyCallback
  //     ): void {
  //       // callback && callback(null, undefined);
  //     });

  //   try {
  //     await auth_utils.authenticate({});
  //   } catch (actualError) {
  //     expect(actualError).instanceOf(HTTP401);
  //   }
  // });
});
