import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import user_queries from '../queries/users';
import { getMockDBConnection } from '../__mocks__/db';
import * as system_user from './system-user';

chai.use(sinonChai);

describe('user', () => {
  describe('ensureSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws a 400 error if it fails to get the current system user id', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => null });

      const mockSystemUser = null;
      const getSystemUserStub = sinon.stub(system_user, 'getSystemUser').resolves(mockSystemUser);

      const activateDeactivatedSystemUserStub = sinon
        .stub(system_user, 'activateDeactivatedSystemUser')
        .resolves(mockSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await system_user.ensureSystemUser(userIdentifier, identitySource, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
        expect((actualError as HTTPError).status).to.equal(400);
      }

      expect(getSystemUserStub).to.have.been.calledOnce;
      expect(activateDeactivatedSystemUserStub).not.to.have.been.called;
    });

    it('adds a new system user if one does not already exist', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getSystemUserStub = sinon.stub(system_user, 'getSystemUser').resolves(existingSystemUser);

      const addedSystemUser = { id: 2, user_record_end_date: null };
      const addSystemUserStub = sinon.stub(system_user, 'addSystemUser').resolves(addedSystemUser);

      const activateDeactivatedSystemUserStub = sinon
        .stub(system_user, 'activateDeactivatedSystemUser')
        .resolves(addedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.ensureSystemUser(userIdentifier, identitySource, mockDBConnection);

      expect(result.id).to.equal(2);
      expect(result.user_record_end_date).to.equal(null);

      expect(getSystemUserStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateDeactivatedSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user and re-activates it', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = {
        id: 2,
        user_record_end_date: '2021-11-22',
        user_identifier: 'idir',
        role_ids: [1],
        role_names: ['Editor']
      };
      const getSystemUserStub = sinon.stub(system_user, 'getSystemUser').resolves(existingSystemUser);

      const addedSystemUser = null;
      const addSystemUserStub = sinon.stub(system_user, 'addSystemUser').resolves(addedSystemUser);

      const reactivatedSystemUser = { id: 2, user_record_end_date: null };
      const activateDeactivatedSystemUserStub = sinon
        .stub(system_user, 'activateDeactivatedSystemUser')
        .resolves(reactivatedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.ensureSystemUser(userIdentifier, identitySource, mockDBConnection);

      expect(result.id).to.equal(2);
      expect(result.user_record_end_date).to.equal(null);

      expect(getSystemUserStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateDeactivatedSystemUserStub).to.have.been.calledOnce;
    });
  });

  describe('getSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(null);

      const userIdentifier = 'username';

      try {
        await system_user.getSystemUser(userIdentifier, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns null if no rows returned', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';

      const result = await system_user.getSystemUser(userIdentifier, mockDBConnection);

      expect(result).to.equal(null);
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';

      const result = await system_user.getSystemUser(userIdentifier, mockDBConnection);

      expect(result).to.eql(mockRowObj);
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(user_queries, 'addSystemUserSQL').returns(null);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert system user');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });

    it('should not throw an error on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const addSystemUserSQLStub = sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
      expect(result).to.eql(mockRowObj);

      expect(addSystemUserSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('activateDeactivatedSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(user_queries, 'activateSystemUserSQL').returns(null);

      const systemuserId = 1;

      try {
        await system_user.activateDeactivatedSystemUser(systemuserId, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(user_queries, 'activateSystemUserSQL').returns(SQL`valid sql`);

      const systemuserId = 1;

      try {
        await system_user.activateDeactivatedSystemUser(systemuserId, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to activate system user');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should not throw an error on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rowCount: 1, rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const activateSystemUserSQLStub = sinon.stub(user_queries, 'activateSystemUserSQL').returns(SQL`valid sql`);

      const systemuserId = 1;

      const result = await system_user.activateDeactivatedSystemUser(systemuserId, mockDBConnection);
      expect(result).to.eql(mockRowObj);

      expect(activateSystemUserSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(user_queries, 'addSystemUserSQL').returns(null);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      try {
        await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert system user');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });

    it('should not throw an error on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const addSystemUserSQLStub = sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`valid sql`);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.addSystemUser(userIdentifier, identitySource, mockDBConnection);
      expect(result).to.eql(mockRowObj);

      expect(addSystemUserSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });
});
