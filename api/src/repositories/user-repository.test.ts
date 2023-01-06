import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { UserRepository } from './user-repository';

chai.use(sinonChai);

describe('UserRepository', () => {
  describe('getRoles', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get all roles', async () => {
      const mockResponse = [{ system_role_id: 1, name: 'admin' }];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getRoles();

      expect(response).to.equal(mockResponse);
    });
  });

  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw an error when no user is found', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.getUserById(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to get user by id');
      }
    });

    it('should get user by id', async () => {
      const mockResponse = [
        { system_user_id: 1, user_identifier: 1, record_end_date: 'data', role_ids: [1], role_names: ['admin'] }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserById(1);

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('getUserByGuid', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return empty array when no user found', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserByGuid('user');

      expect(response).to.eql([]);
    });

    it('should get user by guid', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 1,
          user_guid: 'aaaa',
          identity_source: 'idir',
          record_end_date: 'data',
          role_ids: [1],
          role_names: ['admin']
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.getUserByGuid('aaaa');

      expect(response).to.equal(mockResponse);
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw an error when insert fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.addSystemUser('user-guid', 'user', 'idir');
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to insert new user');
      }
    });

    it('should insert new user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identity_source_id: 1,
          user_identifier: 'user',
          user_guid: 'aaaa',
          record_end_date: 'data',
          record_effective_date: 'date'
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.addSystemUser('aaaa', 'user', 'idir');

      expect(response).to.equal(mockResponse[0]);
    });
  });

  describe('listSystemUsers', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should return empty array when no users found', async () => {
      const mockQueryResponse = { rowCount: 1, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.listSystemUsers();

      expect(response).to.eql([]);
    });

    it('should get user list', async () => {
      const mockResponse = [
        { system_user_id: 1, user_identifier: 1, record_end_date: 'data', role_ids: [1], role_names: ['admin'] }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.listSystemUsers();

      expect(response).to.equal(mockResponse);
    });
  });

  describe('activateSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw an error when activate fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.activateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to activate system user');
      }
    });

    it('should activate user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identity_source_id: 1,
          user_identifier: 1,
          record_end_date: 'data',
          record_effective_date: 'date'
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.activateSystemUser(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('deactivateSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw an error when deactivate fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.deactivateSystemUser(1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to deactivate system user');
      }
    });

    it('should deactivate user', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identity_source_id: 1,
          user_identifier: 1,
          record_end_date: 'data',
          record_effective_date: 'date'
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.deactivateSystemUser(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('deleteUserSystemRoles', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete user roles', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identity_source_id: 1,
          user_identifier: 1,
          record_end_date: 'data',
          record_effective_date: 'date'
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.deleteUserSystemRoles(1);

      expect(response).to.equal(undefined);
    });
  });

  describe('addUserSystemRoles', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw an error when adding role fails', async () => {
      const mockQueryResponse = { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      try {
        await userRepository.addUserSystemRoles(1, [1]);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiExecuteSQLError).message).to.equal('Failed to insert user system roles');
      }
    });

    it('should add user roles', async () => {
      const mockResponse = [
        {
          system_user_id: 1,
          user_identity_source_id: 1,
          user_identifier: 1,
          record_end_date: 'data',
          record_effective_date: 'date'
        }
      ];
      const mockQueryResponse = { rowCount: 1, rows: mockResponse } as any as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const userRepository = new UserRepository(mockDBConnection);

      const response = await userRepository.addUserSystemRoles(1, [1, 2]);

      expect(response).to.equal(undefined);
    });
  });
});
