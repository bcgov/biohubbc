import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostOccurrence } from '../models/occurrence-create';
import { queries } from '../queries/queries';
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
        query: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.getOccurrenceSubmission(1);

      expect(response).to.not.be.null;
      expect(response).to.eql({ occurrence_submission_id: 1 });
    });

    it('should return null', async () => {
      const mockQuery = sinon.stub(queries.survey, 'getSurveyOccurrenceSubmissionSQL').returns(null);

      const dbConnection = getMockDBConnection();
      const repo = new OccurrenceRepository(dbConnection);

      try {
        await repo.getOccurrenceSubmission(1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Rejected');
      }
    });
  });

  describe('getOccurrencesForView', () => {
    it('should return list of occurrences', async () => {
      const mockResponse = ({ rows: [{ occurrence_id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.getOccurrencesForView(1);

      expect(response).to.have.length.greaterThan(0);
    });

    it('should throw `Failed to build SQL` error', async () => {
      const mockQuery = sinon.stub(queries.occurrence, 'getOccurrencesForViewSQL').returns(null);

      const dbConnection = getMockDBConnection();
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.getOccurrencesForView(1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to build SQL get occurrences for view statement');
      }
    });

    it('should throw `Failed to get occurrences` error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.getOccurrencesForView(1);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to get occurrences view data');
      }
    });
  });

  describe('insertPostOccurrences', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ occurrence_submission_id: 1 }] } as any) as Promise<
        QueryResult<any>
      >;
      const postOccurrence = new PostOccurrence({
        associatedTaxa: '',
        lifeStage: '',
        sex: '',
        data: {},
        verbatimCoordinates: '',
        individualCount: 1,
        vernacularName: '',
        organismQuantity: '',
        organismQuantityType: '',
        eventDate: ''
      });
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.insertPostOccurrences(1, postOccurrence);
      expect(response).to.be.eql({ occurrence_submission_id: 1 });
    });

    it('should throw `Failed to build SQL` error', async () => {
      const postOccurrence = new PostOccurrence({});
      const mockQuery = sinon.stub(queries.occurrence, 'postOccurrenceSQL').returns(null);
      const dbConnection = getMockDBConnection();
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.insertPostOccurrences(1, postOccurrence);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to build SQL post statement');
      }
    });

    it('should throw `Failed to insert` error', async () => {
      const postOccurrence = new PostOccurrence({});
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: async () => {
          return mockResponse;
        }
      });
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.insertPostOccurrences(1, postOccurrence);
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to insert occurrence data');
      }
    });
  });

  describe('updateSurveyOccurrenceSubmissionWithOutputKey', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rowCount: 1, rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });
      const repo = new OccurrenceRepository(dbConnection);
      const response = await repo.updateSurveyOccurrenceSubmissionWithOutputKey(1, 'fileName', 'outputkey');
      expect(response).to.be.eql({ id: 1 });
    });

    it('should throw `Failed to build SQL` error', async () => {
      const dbConnection = getMockDBConnection();
      const repo = new OccurrenceRepository(dbConnection);
      try {
        await repo.updateSurveyOccurrenceSubmissionWithOutputKey(1, '', '');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.equal('Failed to build SQL update statement');
      }
    });

    it('should throw `Failed to update` error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: async () => {
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
      const mockResponse = ({ rows: [] } as any) as Promise<QueryResult<any>>;
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
        expect(error instanceof SubmissionError).to.be.true;
        expect((error as SubmissionError).submissionMessages[0].type).to.be.eql(
          SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION
        );
      }
    });
  });
});
