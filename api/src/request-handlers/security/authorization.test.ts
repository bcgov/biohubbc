import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../database/db';
import { CustomError, HTTP403 } from '../../errors/CustomError';
import * as user_queries from '../../queries/users/user-queries';
import { getMockDBConnection } from '../../__mocks__/db';
import * as authorization from './authorization';

chai.use(sinonChai);

describe('userHasValidSystemRoles', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidSystemRoles('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = authorization.userHasValidSystemRoles('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidSystemRoles('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidSystemRoles('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidSystemRoles('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidSystemRoles([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidSystemRoles([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidSystemRoles(['admin'], ['admin']);

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

  const dbConnectionObj = getMockDBConnection();

  it('should return null when no system user id', async function () {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const result = await authorization.getSystemUser(keycloakToken);

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

    const result = await authorization.getSystemUser(keycloakToken);

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

    const result = await authorization.getSystemUser(keycloakToken);

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
        return {
          rowCount: 0,
          rows: []
        } as unknown as QueryResult<any>;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    const result = await authorization.getSystemUser(keycloakToken);

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
      await authorization.getSystemUser(keycloakToken);
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
      await authorization.authorize({ keycloak_token: '' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('throws HTTP403 when the keycloak_token is undefined', async function () {
    try {
      await authorization.authorize(undefined, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('returns true without scopes', async function () {
    const result = await authorization.authorize({ keycloak_token: 'some token' }, []);
    expect(result).to.be.true;
  });

  it('throws HTTP403 when stubbed getSystemUser returns null', async function () {
    sinon.stub(authorization, 'getSystemUser').resolves(null);

    try {
      await authorization.authorize({ keycloak_token: 'some token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('throws HTTP403 when stubbed getSystemUser throws error', async function () {
    sinon.stub(authorization, 'getSystemUser').rejects(new Error());
    try {
      await authorization.authorize({ keycloak_token: 'any token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError as CustomError).instanceOf(HTTP403);
      expect((actualError as CustomError).message).to.equal('Access Denied');
    }
  });

  it('throws HTTP403 when userHasValidSystemRoles returns falsie', async function () {
    sinon.stub(authorization, 'getSystemUser').resolves({
      id: 0,
      user_identifier: 'somebody',
      role_ids: [],
      role_names: []
    });
    sinon.stub(authorization, 'userHasValidSystemRoles').returns(false);

    try {
      await authorization.authorize({ keycloak_token: 'any token' }, ['abc']);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(HTTP403);
    }
  });

  it('authorizes a user with valid roles', async function () {
    sinon.stub(authorization, 'getSystemUser').resolves({
      id: 0,
      user_identifier: 'somebody',
      role_ids: [],
      role_names: ['Role 1']
    });

    const result = await authorization.authorize({ keycloak_token: 'any token' }, ['Role 1']);
    expect(result).to.be.true;
  });
});
