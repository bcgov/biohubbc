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
      const mockResponse = ({
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
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: () => mockResponse
      });

      const service = new SurveyBlockService(dbConnection);
      const response = await service.getSurveyBlocksForSurveyId(1);

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

      const service = new SurveyBlockService(dbConnection);
      const response = await service.getSurveyBlocksForSurveyId(1);
      expect(response).to.be.empty;
    });
  });

  describe('upsertSurveyBlocks', () => {
    it('should succeed with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyBlockService(dbConnection);

      const getOldBlocks = sinon.stub(SurveyBlockService.prototype, 'getSurveyBlocksForSurveyId').resolves([]);
      const deleteBlock = sinon.stub(SurveyBlockService.prototype, 'deleteSurveyBlock').resolves();
      const insertBlock = sinon.stub(SurveyBlockRepository.prototype, 'insertSurveyBlock').resolves();
      const updateBlock = sinon.stub(SurveyBlockRepository.prototype, 'updateSurveyBlock').resolves();

      const blocks: PostSurveyBlock[] = [
        { survey_block_id: null, survey_id: 1, name: 'Old Block', description: 'Updated' },
        { survey_block_id: null, survey_id: 1, name: 'New Block', description: 'block' }
      ];
      await service.upsertSurveyBlocks(1, blocks);

      expect(getOldBlocks).to.be.calledOnce;
      expect(insertBlock).to.be.calledTwice;
      expect(deleteBlock).to.not.be.calledOnce;
      expect(updateBlock).to.not.be.calledOnce;
    });

    it('should run delete block code', async () => {
      const dbConnection = getMockDBConnection();
      const service = new SurveyBlockService(dbConnection);

      const getOldBlocks = sinon.stub(SurveyBlockService.prototype, 'getSurveyBlocksForSurveyId').resolves([
        {
          sample_block_count: 0,
          survey_block_id: 10,
          survey_id: 1,
          name: 'Old Block',
          description: 'Updated',
          revision_count: 1
        },
        {
          sample_block_count: 0,
          survey_block_id: 11,
          survey_id: 1,
          name: 'Old Block',
          description: 'Going to be deleted',
          revision_count: 1
        }
      ]);
      const deleteBlock = sinon.stub(SurveyBlockService.prototype, 'deleteSurveyBlock').resolves();
      const insertBlock = sinon.stub(SurveyBlockRepository.prototype, 'insertSurveyBlock').resolves();
      const updateBlock = sinon.stub(SurveyBlockRepository.prototype, 'updateSurveyBlock').resolves();

      const blocks: PostSurveyBlock[] = [
        { survey_block_id: 10, survey_id: 1, name: 'Old Block', description: 'Updated' },
        { survey_block_id: null, survey_id: 1, name: 'New Block', description: 'block' }
      ];
      await service.upsertSurveyBlocks(1, blocks);

      expect(getOldBlocks).to.be.calledOnce;
      expect(deleteBlock).to.be.calledOnce;
      expect(insertBlock).to.be.calledOnce;
      expect(updateBlock).to.be.calledOnce;
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

      const deleteSurveyBlockRecordStub = sinon
        .stub(SurveyBlockRepository.prototype, 'deleteSurveyBlockRecord')
        .resolves(mockResponse);

      const dbConnection = getMockDBConnection();

      const service = new SurveyBlockService(dbConnection);
      const surveyBlockId = 1;
      const response = await service.deleteSurveyBlock(surveyBlockId);

      expect(response).to.eql(mockResponse);
      expect(deleteSampleBlockRecordsByBlockIdsStub).to.have.been.calledOnceWith([surveyBlockId]);
      expect(deleteSurveyBlockRecordStub).to.have.been.calledOnceWith(surveyBlockId);
    });
  });
});
