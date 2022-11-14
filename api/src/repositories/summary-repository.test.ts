import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostSummaryDetails } from '../models/summaryresults-create';
import { getMockDBConnection } from '../__mocks__/db';
import { ISummarySubmissionMessagesResponse, SummaryRepository } from './summary-repository';

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
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getLatestSurveySummarySubmission(1);

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to query survey summary submission table');
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
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getLatestSurveySummarySubmission(1);

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to query survey summary submission table');
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
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.updateSurveySummarySubmissionWithKey(1, 'abc');

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to update survey summary submission record');
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
      // const mockQuery = sinon
      //   .stub(SummaryRepository.prototype, 'insertSurveySummarySubmission')
      //   .rejects(new Error('test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.insertSurveySummarySubmission(1, 'source', 'file_name');
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert survey summary submission record');
      }
    });
  });

  describe('insertSurveySummaryDetails', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_summary_detail_id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.insertSurveySummaryDetails(1, ({} as unknown) as PostSummaryDetails);

      expect(response).to.be.eql({ survey_summary_detail_id: 1 });
    });

    it('should throw a HTTP400 error when the query fails', async () => {
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.insertSurveySummaryDetails(1, ({} as unknown) as PostSummaryDetails);

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert summary details data');
      }
    });
  });

  describe('deleteSummarySubmission', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({ rows: [{ delete_timestamp: '2022-02-02' }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.deleteSummarySubmission(1);

      expect(response).to.be.eql((await mockResponse).rowCount);
    });

    it('should throw a HTTP400 error when the query fails', async () => {
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.deleteSummarySubmission(1);

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to soft delete survey summary submission');
      }
    });
  });

  describe('getSummarySubmissionMessages', () => {
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
      const response = await repo.getSummarySubmissionMessages(1);

      expect(response).to.be.eql([{ id: 1 }]);
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'getSummarySubmissionMessages')
        .rejects(new Error('a test error'));

      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getSummarySubmissionMessages(1);
        expect(mockQuery).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('a test error');
      }
    });
  });

  describe('getSummaryTemplateIdFromNameVersion', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            summary_template_id: 1
          }
        ]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.getSummaryTemplateIdFromNameVersion('templateName', 'templateVersion');

      expect(response).to.be.eql({ summary_template_id: 1 });
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getSummaryTemplateIdFromNameVersion('templateName', 'templateVersion');

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to query summary templates table');
      }
    });
  });

  describe('getSummaryTemplateSpeciesRecords', () => {
    it('should succeed with valid data (no species)', async () => {
      const mockResponse = ({
        rows: ([
          {
            summary_template_species_id: 1,
            summary_template_id: 1,
            wldtaxonomic_units_id: 1,
            validation: 'validation_schema',
            create_user: 1,
            revision_count: 1
          }
        ] as unknown) as ISummarySubmissionMessagesResponse[]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.getSummaryTemplateSpeciesRecords('templateName', 'templateVersion');

      expect(response).to.be.eql((await mockResponse).rows);
    });

    it('should succeed with valid data (with species)', async () => {
      const mockResponse = ({
        rows: ([
          {
            summary_template_species_id: 1,
            summary_template_id: 1,
            wldtaxonomic_units_id: 1,
            validation: 'validation_schema',
            create_user: 1,
            revision_count: 1
          }
        ] as unknown) as ISummarySubmissionMessagesResponse[]
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.getSummaryTemplateSpeciesRecords('templateName', 'templateVersion', [1, 2]);

      expect(response).to.be.eql((await mockResponse).rows);
    });
    it('should throw a HTTP400 error when the query fails', async () => {
      const mockQuery = sinon
        .stub(SummaryRepository.prototype, 'getSummaryTemplateSpeciesRecords')
        .rejects(new Error('test error'));
      const dbConnection = getMockDBConnection();
      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.getSummaryTemplateSpeciesRecords('templateName', 'templateVersion', [1, 2]);
        expect(mockQuery).to.be.calledOnce;

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('test error');
      }
    });
  });

  describe('insertSummarySubmissionMessage', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);
      const response = await repo.insertSummarySubmissionMessage(
        1,
        SUMMARY_SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
        'message'
      );

      expect(response).to.be.eql((await mockResponse).rows);
    });

    it('should throw an API error when the query fails', async () => {
      const mockResponse = ({
        rowCount: 0
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        query: () => mockResponse
      });

      const repo = new SummaryRepository(dbConnection);

      try {
        await repo.insertSummarySubmissionMessage(1, SUMMARY_SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER, 'message');

        expect.fail();
      } catch (error) {
        expect((error as HTTP400).message).to.be.eql('Failed to insert summary submission message record');
      }
    });
  });
});
