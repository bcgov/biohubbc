import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { CustomError } from '../../errors/CustomError';
import { UserObject } from '../../models/user';
import { getMockDBConnection } from '../../__mocks__/db';
import * as systemUser from '../user/system-user';
import * as userQueries from '../../queries/users/user-queries';
import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getSystemUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(systemUser, 'getSystemUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    try {
      await systemUser.getSystemUserObject(mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as CustomError).message).to.equal('failed to get system user');
      expect((error as CustomError).status).to.equal(500);
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(systemUser, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    try {
      await systemUser.getSystemUserObject(mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as CustomError).message).to.equal('system user was null');
      expect((error as CustomError).status).to.equal(500);
    }
  });

  it('returns a `UserObject`', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = {};
    sinon.stub(systemUser, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const systemUserObject = await systemUser.getSystemUserObject(mockDBConnection);

    expect(systemUserObject).to.be.instanceOf(UserObject);
  });
});

describe('getSystemUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => null });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const result = await systemUser.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns null if the get user by id SQL statement is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = null;
    sinon.stub(userQueries, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

    const result = await systemUser.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns null if the query response is null', async function () {
    const mockQueryResponse = null as unknown as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon.stub(userQueries, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

    const result = await systemUser.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns the first row of the response', async function () {
    const mockResponseRow = { 'Test Column': 'Test Value' };
    const mockQueryResponse = { rowCount: 1, rows: [mockResponseRow] } as unknown as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon.stub(userQueries, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

    const result = await systemUser.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.eql(mockResponseRow);
  });
});
