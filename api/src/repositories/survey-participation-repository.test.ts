import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyParticipationRepository } from './survey-participation-repository';

chai.use(sinonChai);

describe('SurveyParticipationRepository', () => {
  describe('getSurveyJobs', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.getSurveyJobs();

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error when no rows returned', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      try {
        await repository.getSurveyJobs();
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get survey jobs');
      }
    });
  });

  describe('getSurveyParticipant', () => {
    it('should return result', async () => {
      const mockResponse = {
        rows: [
          {
            system_user_id: 1
          }
        ],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.getSurveyParticipant(1, 1);

      expect(response).to.eql({ system_user_id: 1 });
    });

    it('should return null', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.getSurveyParticipant(1, 1);

      expect(response).to.eql(null);
    });
  });

  describe('getSurveyParticipants', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.getSurveyParticipants(1);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return no rows', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.getSurveyParticipants(1);

      expect(response).to.eql([]);
    });
  });

  describe('insertSurveyParticipant', () => {
    describe('with job name', () => {
      it('should return result', async () => {
        const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new SurveyParticipationRepository(dbConnection);

        const response = await repository.insertSurveyParticipant(1, 1, 'string');

        expect(response).to.eql(undefined);
      });

      it('should throw an error', async () => {
        const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new SurveyParticipationRepository(dbConnection);

        try {
          await repository.insertSurveyParticipant(1, 1, 'string');
          expect.fail();
        } catch (error) {
          expect((error as Error).message).to.equal('Failed to insert survey participant');
        }
      });
    });
  });

  describe('updateSurveyParticipantJob', () => {
    describe('with job name', () => {
      it('should return result', async () => {
        const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new SurveyParticipationRepository(dbConnection);

        const response = await repository.updateSurveyParticipantJob(1, 1, 'string');

        expect(response).to.eql(undefined);
      });

      it('should throw an error', async () => {
        const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
        const dbConnection = getMockDBConnection({ sql: () => mockResponse });

        const repository = new SurveyParticipationRepository(dbConnection);

        try {
          await repository.updateSurveyParticipantJob(1, 1, 'string');
          expect.fail();
        } catch (error) {
          expect((error as Error).message).to.equal('Failed to update survey participant');
        }
      });
    });
  });

  describe('deleteSurveyParticipationRecord', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      const response = await repository.deleteSurveyParticipationRecord(1, 1);

      expect(response).to.eql({ id: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = undefined as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyParticipationRepository(dbConnection);

      try {
        await repository.deleteSurveyParticipationRecord(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to delete survey participation record');
      }
    });
  });
});
