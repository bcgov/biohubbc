import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationRepository } from './project-participation-repository';

chai.use(sinonChai);

describe('ProjectParticipationRepository', () => {
  describe('deleteProjectParticipationRecord', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const response = await repository.deleteProjectParticipationRecord(1, 1);

      expect(response).to.eql({ id: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      try {
        await repository.deleteProjectParticipationRecord(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to delete project participation record');
      }
    });
  });

  describe('getProjectParticipant', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [
          {
            system_user_id: 1
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const response = await repository.getProjectParticipant(1, 1);

      expect(response).to.eql({ system_user_id: 1 });
    });

    it('should return null', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const response = await repository.getProjectParticipant(1, 1);

      expect(response).to.eql(null);
    });
  });

  describe('getProjectParticipantByProjectIdAndUserGuid', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [
          {
            user_guid: '123-456-789'
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const projectId = 1;
      const userGuid = '123-456-789';

      const response = await repository.getProjectParticipantByProjectIdAndUserGuid(projectId, userGuid);

      expect(response).to.eql({ user_guid: '123-456-789' });
    });

    it('should return null', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const projectId = 1;
      const userGuid = '123-456-789';

      const response = await repository.getProjectParticipantByProjectIdAndUserGuid(projectId, userGuid);

      expect(response).to.eql(null);
    });
  });

  describe('getProjectParticipantBySurveyIdAndUserGuid', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [
          {
            user_guid: '123-456-789'
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const surveyId = 1;
      const userGuid = '123-456-789';

      const response = await repository.getProjectParticipantBySurveyIdAndUserGuid(surveyId, userGuid);

      expect(response).to.eql({ user_guid: '123-456-789' });
    });

    it('should return null', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const surveyId = 1;
      const userGuid = '123-456-789';

      const response = await repository.getProjectParticipantBySurveyIdAndUserGuid(surveyId, userGuid);

      expect(response).to.eql(null);
    });
  });

  describe('getProjectParticipants', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      const response = await repository.getProjectParticipants(1);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error when no rows returned', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectParticipationRepository(dbConnection);

      try {
        await repository.getProjectParticipants(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project team members');
      }
    });
  });

  describe('postProjectParticipant', () => {
    describe('with role id', () => {
      it('should return result', async () => {
        const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new ProjectParticipationRepository(dbConnection);

        const response = await repository.postProjectParticipant(1, 1, 1);

        expect(response).to.eql(undefined);
      });

      it('should throw an error when no rows returned', async () => {
        const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new ProjectParticipationRepository(dbConnection);

        try {
          await repository.postProjectParticipant(1, 1, 1);
          expect.fail();
        } catch (error) {
          expect((error as Error).message).to.equal('Failed to insert project team member');
        }
      });
    });

    describe('with role name', () => {
      it('should throw an error when no user found', async () => {
        const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new ProjectParticipationRepository(dbConnection);

        try {
          await repository.postProjectParticipant(1, 1, 'string');
          expect.fail();
        } catch (error) {
          expect((error as Error).message).to.equal('Failed to insert project team member');
        }
      });

      it('should return result', async () => {
        const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse, systemUserId: () => 1 });

        const repository = new ProjectParticipationRepository(dbConnection);

        const response = await repository.postProjectParticipant(1, 1, 'string');

        expect(response).to.eql(undefined);
      });

      it('should throw an error', async () => {
        const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse, systemUserId: () => 1 });

        const repository = new ProjectParticipationRepository(dbConnection);

        try {
          await repository.postProjectParticipant(1, 1, 'string');
          expect.fail();
        } catch (error) {
          expect((error as Error).message).to.equal('Failed to insert project team member');
        }
      });
    });
  });
});
