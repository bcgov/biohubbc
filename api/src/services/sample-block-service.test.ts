import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSampleBlockRecord,
  SampleBlockRecord,
  SampleBlockRepository,
  UpdateSampleBlockRecord
} from '../repositories/sample-blocks-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleBlockService } from './sample-block-service';

chai.use(sinonChai);

describe('SampleBlockService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const sampleBlockService = new SampleBlockService(mockDBConnection);

    expect(sampleBlockService).to.be.instanceof(SampleBlockService);
  });

  describe('getSampleBlocksForSurveySampleSiteId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets sample blocks for a survey sample site', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleBlockRecords: SampleBlockRecord[] = [
        {
          survey_sample_block_id: 1,
          survey_sample_site_id: 2,
          survey_block_id: 3,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSampleBlocksForSurveySampleSiteIdStub = sinon
        .stub(SampleBlockRepository.prototype, 'getSampleBlocksForSurveySampleSiteId')
        .resolves(mockSampleBlockRecords);

      const surveySampleSiteId = 1;
      const sampleBlockService = new SampleBlockService(mockDBConnection);
      const response = await sampleBlockService.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

      expect(getSampleBlocksForSurveySampleSiteIdStub).to.be.calledOnceWith(surveySampleSiteId);
      expect(response).to.eql(mockSampleBlockRecords);
    });
  });

  describe('getSampleBlocksForSurveyBlockId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets sample blocks for a survey block', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleBlockRecords: SampleBlockRecord[] = [
        {
          survey_sample_block_id: 3,
          survey_sample_site_id: 2,
          survey_block_id: 1,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSampleBlocksForSurveyBlockStub = sinon
        .stub(SampleBlockRepository.prototype, 'getSampleBlocksForSurveyBlockId')
        .resolves(mockSampleBlockRecords);

      const surveyBlockId = 1;
      const sampleBlockService = new SampleBlockService(mockDBConnection);
      const response = await sampleBlockService.getSampleBlocksForSurveyBlockId(surveyBlockId);

      expect(getSampleBlocksForSurveyBlockStub).to.be.calledOnceWith(surveyBlockId);
      expect(response).to.eql(mockSampleBlockRecords);
    });
  });

  describe('getSampleBlocksCountForSurveyBlockId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets count of survey blocks for a given block', async () => {
      const mockDBConnection = getMockDBConnection();
      const sampleBlockService = new SampleBlockService(mockDBConnection);

      const mockSampleBlockCount = 2;

      const getSampleBlocksCountForSurveyBlockIdStub = sinon
        .stub(SampleBlockRepository.prototype, 'getSampleBlocksCountForSurveyBlockId')
        .resolves(mockSampleBlockCount);

      const surveyBlockId = 1;

      const response = await sampleBlockService.getSampleBlocksCountForSurveyBlockId(surveyBlockId);

      expect(getSampleBlocksCountForSurveyBlockIdStub).to.be.calledOnceWith(surveyBlockId);
      expect(response).to.eql(mockSampleBlockCount);
    });
  });

  describe('deleteSampleBlockRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('deletes sample block records', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleBlockRecords: SampleBlockRecord[] = [
        {
          survey_sample_block_id: 3,
          survey_sample_site_id: 2,
          survey_block_id: 1,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const deleteSampleBlockRecordsStub = sinon
        .stub(SampleBlockRepository.prototype, 'deleteSampleBlockRecords')
        .resolves(mockSampleBlockRecords);

      const surveySampleBlockId = [1];
      const sampleBlockService = new SampleBlockService(mockDBConnection);
      const response = await sampleBlockService.deleteSampleBlockRecords(surveySampleBlockId);

      expect(deleteSampleBlockRecordsStub).to.be.calledOnceWith(surveySampleBlockId);
      expect(response).to.eql(mockSampleBlockRecords);
    });
  });

  describe('deleteSampleBlockRecordsByBlockIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('deletes sample block records', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleBlockRecords: SampleBlockRecord[] = [
        {
          survey_sample_block_id: 1,
          survey_sample_site_id: 2,
          survey_block_id: 3,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const deleteSampleBlockRecordsByBlockIdsStub = sinon
        .stub(SampleBlockRepository.prototype, 'deleteSampleBlockRecordsByBlockIds')
        .resolves(mockSampleBlockRecords);

      const surveyBlockId = [1];
      const sampleBlockService = new SampleBlockService(mockDBConnection);
      const response = await sampleBlockService.deleteSampleBlockRecordsByBlockIds(surveyBlockId);

      expect(deleteSampleBlockRecordsByBlockIdsStub).to.be.calledOnceWith(surveyBlockId);
      expect(response).to.eql(mockSampleBlockRecords);
    });
  });

  describe('insertSampleBlock', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('inserts sample blocks', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleBlockRecord: SampleBlockRecord = {
        survey_sample_block_id: 1,
        survey_sample_site_id: 2,
        survey_block_id: 3,
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSampleBlockStub = sinon
        .stub(SampleBlockRepository.prototype, 'insertSampleBlock')
        .resolves(mockSampleBlockRecord);

      const sampleBlock: InsertSampleBlockRecord = {
        survey_sample_site_id: 2,
        survey_block_id: 3
      };

      const sampleBlockService = new SampleBlockService(mockDBConnection);
      const response = await sampleBlockService.insertSampleBlock(sampleBlock);

      expect(insertSampleBlockStub).to.be.calledOnceWith(sampleBlock);

      expect(response).to.eql(mockSampleBlockRecord);
    });
  });

  describe('deleteSampleBlocksNotInArray', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();

      const survey_sample_block_id = 1;

      const mockSampleBlockRecord: SampleBlockRecord = {
        survey_sample_block_id: survey_sample_block_id,
        survey_sample_site_id: 1,
        survey_block_id: 3,
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };

      const mockSampleBlockRecords: SampleBlockRecord[] = [mockSampleBlockRecord];
      const getSampleBlocksForSurveySampleSiteIdStub = sinon
        .stub(SampleBlockRepository.prototype, 'getSampleBlocksForSurveySampleSiteId')
        .resolves(mockSampleBlockRecords);

      const deleteSampleBlockRecordsNotInArrayStub = sinon
        .stub(SampleBlockService.prototype, 'deleteSampleBlocksNotInArray')
        .resolves();

      const surveySampleSiteId = 1;

      const sampleBlockService = new SampleBlockService(mockDBConnection);

      await sampleBlockService.deleteSampleBlocksNotInArray(surveySampleSiteId, [
        { survey_sample_block_id: survey_sample_block_id } as UpdateSampleBlockRecord
      ]);
      await sampleBlockService.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

      expect(getSampleBlocksForSurveySampleSiteIdStub).to.be.calledOnceWith(surveySampleSiteId);
      expect(deleteSampleBlockRecordsNotInArrayStub).to.be.calledOnceWith(mockSampleBlockRecord.survey_sample_block_id);
    });
  });
});
