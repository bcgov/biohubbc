import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { PostSurveyBlock, SurveyBlockRepository } from './survey-block-repository';

chai.use(sinonChai);

describe('SurveyBlockRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSurveyBlocksForSurveyId', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_block_id: 1,
            survey_id: 1,
            name: '',
            description: '',
            create_date: '',
            create_user: 1,
            update_date: '',
            update_user: 1,
            revision_count: 1
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      const response = await repo.getSurveyBlocksForSurveyId(1);

      response.forEach((item) => {
        expect(item.survey_id).to.be.eql(1);
      });
    });

    it('should succeed with empty data', async () => {
      const mockResponse = ({
        rows: [],
        rowCount: 0
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      const response = await repo.getSurveyBlocksForSurveyId(1);
      expect(response).to.be.empty;
    });
  });

  describe('updateSurveyBlock', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_block_id: 1,
            survey_id: 1,
            name: 'Updated name',
            description: '',
            create_date: '',
            create_user: 1,
            update_date: '',
            update_user: 1,
            revision_count: 1
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      const block: PostSurveyBlock = { survey_block_id: 1, survey_id: 1, name: 'Updated name', description: 'block' };
      const response = await repo.updateSurveyBlock(block);
      expect(response.survey_block_id).to.be.eql(1);
      expect(response.name).to.be.eql('Updated name');
    });

    it('should failed with erroneous data', async () => {
      const mockResponse = ({
        rows: [],
        rowCount: 0
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      const block: PostSurveyBlock = { survey_block_id: null, survey_id: 1, name: 'new', description: 'block' };
      try {
        await repo.updateSurveyBlock(block);
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eq('Failed to update survey block');
      }
    });
  });

  describe('insertSurveyBlock', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_block_id: 1,
            survey_id: 1,
            name: 'new',
            description: 'block',
            create_date: '',
            create_user: 1,
            update_date: '',
            update_user: 1,
            revision_count: 1
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new SurveyBlockRepository(dbConnection);

      const block: PostSurveyBlock = { survey_block_id: null, survey_id: 1, name: 'new', description: 'block' };
      const response = await repo.insertSurveyBlock(block);

      expect(response.name).to.be.eql('new');
      expect(response.description).to.be.eql('block');
    });

    it('should fail with erroneous data', async () => {
      const mockResponse = ({
        rows: [],
        rowCount: 0
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });
      const repo = new SurveyBlockRepository(dbConnection);
      try {
        const block = ({
          survey_block_id: null,
          survey_id: 1,
          name: null,
          description: null
        } as any) as PostSurveyBlock;
        await repo.insertSurveyBlock(block);
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eq('Failed to insert survey block');
      }
    });
  });

  describe('deleteSurveyBlockRecord', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = ({
        rows: [
          {
            survey_block_id: 1,
            survey_id: 1,
            name: 'Deleted record',
            description: '',
            create_date: '',
            create_user: 1,
            update_date: '',
            update_user: 1,
            revision_count: 1
          }
        ],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      const response = await repo.deleteSurveyBlockRecord(1);
      expect(response.survey_block_id).to.be.eql(1);
    });

    it('should failed with erroneous data', async () => {
      const mockResponse = ({
        rows: [],
        rowCount: 0
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const repo = new SurveyBlockRepository(dbConnection);
      try {
        await repo.deleteSurveyBlockRecord(1);
        expect.fail();
      } catch (error) {
        expect(((error as any) as ApiExecuteSQLError).message).to.be.eq('Failed to delete survey block record');
      }
    });
  });
});
