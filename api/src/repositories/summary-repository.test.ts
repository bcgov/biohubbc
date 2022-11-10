import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTP400 } from '../errors/http-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SummaryRepository } from './summary-repository';

chai.use(sinonChai);

describe.only('SummaryRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('findSummarySubmissionById', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.findSummarySubmissionById(1);

      expect(response).to.be.eql({ id: 1 });
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'findSummarySubmissionById')
        .rejects(new Error('a HTTP 400 test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.findSummarySubmissionById(1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('a HTTP 400 test error');
      }
    });
  });

  describe('getLatestSurveySummarySubmission', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.getLatestSurveySummarySubmission(1);

      expect(response).to.be.eql({ id: 1 });
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'getLatestSurveySummarySubmission')
        .rejects(new Error('a test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getLatestSurveySummarySubmission(1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('a test error');
      }
    });
  });

  describe('updateSurveySummarySubmissionWithKey', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_summary_submission_id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.updateSurveySummarySubmissionWithKey(1, 'abc');

      expect(response).to.be.eql({ survey_summary_submission_id: 1 });
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'updateSurveySummarySubmissionWithKey')
        .rejects(new Error('a test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.updateSurveySummarySubmissionWithKey(1, 'abc');
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('a test error');
      }
    });
  });


  describe('insertSurveySummarySubmission', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_summary_submission_id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.insertSurveySummarySubmission(1, 'source', 'file_name');

      expect(response).to.be.eql({ survey_summary_submission_id: 1 });
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'insertSurveySummarySubmission')
        .rejects(new Error('a test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.insertSurveySummarySubmission(1, 'source', 'file_name');
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('a test error');
      }
    });
  });
});
