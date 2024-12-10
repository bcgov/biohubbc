import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostSurveyBlock, SurveyBlockRepository } from '../repositories/survey-block-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleBlockService } from './sample-block-service';
import { SurveyBlockService } from './survey-block-service';

chai.use(sinonChai);

describe('SurveyBlockService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSurveyBlocksForSurveyId', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = {
        rows: [
          {
            survey_block_id: 1,
            survey_id: 1,
            name: '',
            description: '',
            revision_count: 1,
            sample_block_count: 1
          }
        ],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const service = new SurveyBlockService(dbConnection);
      const response = await service.getSurveyBlocksForSurveyId(1);

      response.forEach((item) => {
        expect(item.survey_id).to.be.eql(1);
      });
    });

    it('should succeed with empty data', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const service = new SurveyBlockService(dbConnection);
      const response = await service.getSurveyBlocksForSurveyId(1);
      expect(response).to.be.empty;
    });
  });

  describe('getSurveyBlocksCountBySurveyId', () => {
    it('should successfully get block count for survey', async () => {
      const mockResponse = {
        rows: [
          {
            count: 1
          }
        ],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const mockSurveyId = 1;
      const service = new SurveyBlockService(dbConnection);
      const response = await service.getSurveyBlocksCountBySurveyId(mockSurveyId);

      expect(response).to.eql(1);
    });
  });

  describe('upsertSurveyBlocks', () => {
    it('should succeed with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyBlockService(dbConnection);

      const insertBlock = sinon.stub(SurveyBlockRepository.prototype, 'insertSurveyBlock').resolves();

      const blocks: PostSurveyBlock[] = [
        {
          survey_block_id: null,
          survey_id: 1,
          name: 'Old Block',
          description: 'Updated',
          geojson: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid1'
          }
        },
        {
          survey_block_id: null,
          survey_id: 1,
          name: 'New Block',
          description: 'block',
          geojson: {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid1'
          }
        }
      ];
      await service.insertSurveyBlocks(1, blocks);

      expect(insertBlock).to.be.calledTwice;
    });
  });

  describe('deleteSurveyBlock', () => {
    it('should succeed with valid data', async () => {
      const mockResponse = {
        survey_block_id: 1,
        survey_id: 1,
        name: 'Deleted record',
        description: '',
        revision_count: 1
      };

      const deleteSampleBlockRecordsByBlockIdsStub = sinon
        .stub(SampleBlockService.prototype, 'deleteSampleBlockRecordsByBlockIds')
        .resolves(undefined);

      const deleteSurveyBlockstub = sinon
        .stub(SurveyBlockRepository.prototype, 'deleteSurveyBlockRecord')
        .resolves(mockResponse);

      const dbConnection = getMockDBConnection();

      const service = new SurveyBlockService(dbConnection);
      const mockSurveyId = 1;
      const surveyBlockId = 1;
      const response = await service.deleteSurveyBlock(mockSurveyId, surveyBlockId);

      expect(response).to.eql(mockResponse);
      expect(deleteSampleBlockRecordsByBlockIdsStub).to.have.been.calledOnceWith(mockSurveyId, [surveyBlockId]);
      expect(deleteSurveyBlockstub).to.have.been.calledOnceWith(surveyBlockId);
    });
  });
});
