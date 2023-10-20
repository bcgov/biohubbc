import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { OccurrenceRepository } from '../repositories/occurrence-repository';
import { SubmissionError } from '../utils/submission-error';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('OccurrenceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getOccurrenceSubmission', () => {
    it('should return a submission', async () => {
      const mockResponse = ({ rows: [{ occurrence_submission_id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.getOccurrenceSubmission(1);

      expect(response).to.eql({ occurrence_submission_id: 1 });
    });

    it('should throw Failed to get occurrence submission error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });

      try {
        const repo = new OccurrenceRepository(dbConnection);
        await repo.getOccurrenceSubmission(1);
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE
        );
      }
    });
  });

  describe('getOccurrencesForView', () => {
    it('should return list of occurrences', async () => {
      const mockResponse = ({ rows: [{ occurrence_id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.getOccurrencesForView(1);

      expect(response).to.have.length.greaterThan(0);
    });
  });

  describe('updateSurveyOccurrenceSubmissionWithOutputKey', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.updateSurveyOccurrenceSubmissionWithOutputKey(1, 'fileName', 'outputkey');
      expect(response).to.be.eql({ id: 1 });
    });

    it('should throw `Failed to update` error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.updateSurveyOccurrenceSubmissionWithOutputKey(1, 'file', 'key');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Rejected');
      }
    });
  });

  describe('updateDWCSourceForOccurrenceSubmission', () => {
    it('should return submission id', async () => {
      const mockResponse = ({ rows: [{ occurrence_submission_id: 1 }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });

      const repo = new OccurrenceRepository(dbConnection);
      const id = await repo.updateDWCSourceForOccurrenceSubmission(1, '{}');
      expect(id).to.be.eql(1);
    });

    it('should throw Failed to update occurrence submission error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });

      try {
        const repo = new OccurrenceRepository(dbConnection);
        await repo.updateDWCSourceForOccurrenceSubmission(1, '{}');
        expect.fail();
      } catch (error) {
        expect(error).to.be.instanceOf(SubmissionError);
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION
        );
      }
    });
  });

  describe('findSpatialMetadataBySubmissionSpatialComponentIds', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.findSpatialMetadataBySubmissionSpatialComponentIds([1]);
      expect(response).to.be.eql([{ id: 1 }]);
    });
  });

  describe('softDeleteOccurrenceSubmission', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.softDeleteOccurrenceSubmission(1);
      expect(response).to.be.eql(undefined);
    });
  });

  describe('deleteSubmissionSpatialComponent', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.deleteSubmissionSpatialComponent(1);
      expect(response).to.be.eql([{ id: 1 }]);
    });
  });

  describe('deleteSpatialTransformSubmission', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.deleteSpatialTransformSubmission(1);
      expect(response).to.be.eql(undefined);
    });
  });
});
