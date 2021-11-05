import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../database/db';
import { CustomError } from '../../errors/CustomError';
import { ProjectUserObject } from '../../models/user';
import * as projectParticipationQueries from '../../queries/project-participation/project-participation-queries';
import { getMockDBConnection } from '../../__mocks__/db';
import * as projectUser from '../user/project-user';

chai.use(sinonChai);

describe('getProjectUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(projectUser, 'getProjectUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    try {
      await projectUser.getProjectUserObject(1, mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as CustomError).message).to.equal('failed to get project user');
      expect((error as CustomError).status).to.equal(500);
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(projectUser, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    try {
      await projectUser.getProjectUserObject(1, mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as CustomError).message).to.equal('project user was null');
      expect((error as CustomError).status).to.equal(500);
    }
  });

  it('returns a `ProjectUserObject`', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = {};
    sinon.stub(projectUser, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const systemUserObject = await projectUser.getProjectUserObject(1, mockDBConnection);

    expect(systemUserObject).to.be.instanceOf(ProjectUserObject);
  });
});

describe('getProjectUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => null });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const result = await projectUser.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns null if the get user by id SQL statement is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = null;
    sinon.stub(projectParticipationQueries, 'getProjectParticipationBySystemUserSQL').returns(mockUsersByIdSQLResponse);

    const result = await projectUser.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns null if the query response is null', async function () {
    const mockQueryResponse = (null as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon.stub(projectParticipationQueries, 'getProjectParticipationBySystemUserSQL').returns(mockUsersByIdSQLResponse);

    const result = await projectUser.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns the first row of the response', async function () {
    const mockResponseRow = { 'Test Column': 'Test Value' };
    const mockQueryResponse = ({ rowCount: 1, rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon.stub(projectParticipationQueries, 'getProjectParticipationBySystemUserSQL').returns(mockUsersByIdSQLResponse);

    const result = await projectUser.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.eql(mockResponseRow);
  });
});
