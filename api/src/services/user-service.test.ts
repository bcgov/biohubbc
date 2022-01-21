import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { ApiError } from '../errors/custom-error';
import { UserObject } from '../models/user';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { UserService } from './user-service';

chai.use(sinonChai);

describe('UserService', () => {
  describe('getUserById', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.getUserById(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL select statement');
      }
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserById(1);

      expect(result).to.be.null;
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockResponseRow = { id: 123 };
      const mockQueryResponse = ({ rows: [mockResponseRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserByIdSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserById(1);

      expect(result).to.eql(new UserObject(mockResponseRow));
    });
  });

  describe('getUserByIdentifier', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'getUserByUserIdentifierSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.getUserByIdentifier('identifier');
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL select statement');
      }
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserByUserIdentifierSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByIdentifier('identifier');

      expect(result).to.be.null;
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockResponseRow = { id: 123 };
      const mockQueryResponse = ({ rows: [mockResponseRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserByUserIdentifierSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByIdentifier('identifier');

      expect(result).to.eql(new UserObject(mockResponseRow));
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      const userService = new UserService(mockDBConnection);

      sinon.stub(queries.users, 'addSystemUserSQL').returns(null);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await userService.addSystemUser(userIdentifier, identitySource);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('should throw an error when response has no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const userService = new UserService(mockDBConnection);

      sinon.stub(queries.users, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await userService.addSystemUser(userIdentifier, identitySource);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert system user');
      }
    });

    it('should not throw an error on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const userService = new UserService(mockDBConnection);

      const addSystemUserSQLStub = sinon.stub(queries.users, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await userService.addSystemUser(userIdentifier, identitySource);

      expect(result).to.eql(new UserObject(mockRowObj));

      expect(addSystemUserSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('listSystemUsers', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'getUserListSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.listSystemUsers();
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL select statement');
      }
    });

    it('returns empty array if the query response has no rows', async function () {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserListSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([]);
    });

    it('returns a UserObject for each row of the response', async function () {
      const mockResponseRow1 = { id: 123 };
      const mockResponseRow2 = { id: 456 };
      const mockResponseRow3 = { id: 789 };
      const mockQueryResponse = ({
        rows: [mockResponseRow1, mockResponseRow2, mockResponseRow3]
      } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'getUserListSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([
        new UserObject(mockResponseRow1),
        new UserObject(mockResponseRow2),
        new UserObject(mockResponseRow3)
      ]);
    });
  });

  describe('ensureSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if it fails to get the current system user id', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => null });

      const existingSystemUser = null;
      const getUserByIdentifierStub = sinon
        .stub(UserService.prototype, 'getUserByIdentifier')
        .resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');
      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const userService = new UserService(mockDBConnection);

      try {
        await userService.ensureSystemUser(userIdentifier, identitySource);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to identify system user ID');
      }

      expect(getUserByIdentifierStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('adds a new system user if one does not already exist', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getUserByIdentifierStub = sinon
        .stub(UserService.prototype, 'getUserByIdentifier')
        .resolves(existingSystemUser);

      const addedSystemUser = new UserObject({ system_user_id: 2, record_end_date: null });
      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser').resolves(addedSystemUser);

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByIdentifierStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is already activate', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingInactiveSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: 'idir',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdentifierStub = sinon
        .stub(UserService.prototype, 'getUserByIdentifier')
        .resolves(existingInactiveSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByIdentifierStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('throws an error if it fails to get the newly activated user', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: 'idir',
        record_end_date: '2021-11-22',
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdentifierStub = sinon
        .stub(UserService.prototype, 'getUserByIdentifier')
        .resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser = null;
      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(activatedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const userService = new UserService(mockDBConnection);

      try {
        await userService.ensureSystemUser(userIdentifier, identitySource);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to ensure system user');
      }

      expect(getUserByIdentifierStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).to.have.been.calledOnce;
      expect(getUserByIdStub).to.have.been.calledOnce;
    });

    it('gets an existing system user that is not already active and re-activates it', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: 'idir',
        record_end_date: '2021-11-22',
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdentifierStub = sinon
        .stub(UserService.prototype, 'getUserByIdentifier')
        .resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: 'idir',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(activatedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByIdentifierStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).to.have.been.calledOnce;
      expect(getUserByIdStub).to.have.been.calledOnce;
    });
  });

  describe('activateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'activateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.activateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL update statement');
      }
    });

    it('throws an error if the query response has no rowCount', async function () {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'activateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.activateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to activate system user');
      }
    });

    it('returns nothing on success', async function () {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'activateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.activateSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deactivateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'deactivateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.deactivateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL update statement');
      }
    });

    it('throws an error if the query response has no rowCount', async function () {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'deactivateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.deactivateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to deactivate system user');
      }
    });

    it('returns nothing on success', async function () {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'deactivateSystemUserSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.deactivateSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deleteUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'deleteAllSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.deleteUserSystemRoles(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL delete statement');
      }
    });

    it('throws an error if the query response has no rowCount', async function () {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'deleteAllSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.deleteUserSystemRoles(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to delete user system roles');
      }
    });

    it('returns nothing on success', async function () {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'deleteAllSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.deleteUserSystemRoles(1);

      expect(result).to.be.undefined;
    });
  });

  describe('addUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockUsersByIdSQLResponse = null;
      sinon.stub(queries.users, 'postSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.addUserSystemRoles(1, [1]);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('throws an error if the query response has no rowCount', async function () {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'postSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      try {
        await userService.addUserSystemRoles(1, [1]);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert user system roles');
      }
    });

    it('returns nothing on success', async function () {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
      sinon.stub(queries.users, 'postSystemRolesSQL').returns(mockUsersByIdSQLResponse);

      const userService = new UserService(mockDBConnection);

      const result = await userService.addUserSystemRoles(1, [1]);

      expect(result).to.be.undefined;
    });
  });
});
