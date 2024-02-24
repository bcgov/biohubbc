import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSampleStratumRecord,
  SampleStratumRecord,
  SampleStratumRepository,
  UpdateSampleStratumRecord
} from '../repositories/sample-stratums-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleStratumService } from './sample-stratum-service';

chai.use(sinonChai);

describe('SampleStratumService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const sampleStratumService = new SampleStratumService(mockDBConnection);

    expect(sampleStratumService).to.be.instanceof(SampleStratumService);
  });

  describe('getSampleStratumsForSurveySampleSiteId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets sample stratums for a survey sample site', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumRecords: SampleStratumRecord[] = [
        {
          survey_sample_stratum_id: 1,
          survey_sample_site_id: 2,
          survey_stratum_id: 3,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSampleStratumsForSurveySampleSiteIdStub = sinon
        .stub(SampleStratumRepository.prototype, 'getSampleStratumsForSurveySampleSiteId')
        .resolves(mockSampleStratumRecords);

      const surveySampleSiteId = 1;
      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);

      expect(getSampleStratumsForSurveySampleSiteIdStub).to.be.calledOnceWith(surveySampleSiteId);
      expect(response).to.eql(mockSampleStratumRecords);
    });
  });

  describe('getSampleStratumsForSurveyStratumId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets sample stratums for a survey stratum', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumRecords: SampleStratumRecord[] = [
        {
          survey_sample_stratum_id: 3,
          survey_sample_site_id: 2,
          survey_stratum_id: 1,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSampleStratumsForSurveyStratumStub = sinon
        .stub(SampleStratumRepository.prototype, 'getSampleStratumsForSurveyStratumId')
        .resolves(mockSampleStratumRecords);

      const surveyStratumId = 1;
      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.getSampleStratumsForSurveyStratumId(surveyStratumId);

      expect(getSampleStratumsForSurveyStratumStub).to.be.calledOnceWith(surveyStratumId);
      expect(response).to.eql(mockSampleStratumRecords);
    });
  });

  describe('getSampleStratumsCountForSurveyStratumId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('gets count of survey stratums for a given stratum', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumCount = { sampleCount: 2 };

      const getSampleStratumsCountForSurveyStratumIdStub = sinon
        .stub(SampleStratumRepository.prototype, 'getSampleStratumsCountForSurveyStratumId')
        .resolves(mockSampleStratumCount);

      const surveyStratumId = 1;
      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.getSampleStratumsCountForSurveyStratumId(surveyStratumId);

      expect(getSampleStratumsCountForSurveyStratumIdStub).to.be.calledOnceWith(surveyStratumId);
      expect(response).to.eql(mockSampleStratumCount);
    });
  });

  describe('deleteSampleStratumRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('deletes sample stratum records', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumRecords: SampleStratumRecord[] = [
        {
          survey_sample_stratum_id: 3,
          survey_sample_site_id: 2,
          survey_stratum_id: 1,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const deleteSampleStratumRecordsStub = sinon
        .stub(SampleStratumRepository.prototype, 'deleteSampleStratumRecords')
        .resolves(mockSampleStratumRecords);

      const surveySampleStratumId = [1];
      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.deleteSampleStratumRecords(surveySampleStratumId);

      expect(deleteSampleStratumRecordsStub).to.be.calledOnceWith(surveySampleStratumId);
      expect(response).to.eql(mockSampleStratumRecords);
    });
  });

  describe('deleteSampleStratumRecordsByStratumIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('deletes sample stratum records', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumRecords: SampleStratumRecord[] = [
        {
          survey_sample_stratum_id: 1,
          survey_sample_site_id: 2,
          survey_stratum_id: 3,
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const deleteSampleStratumRecordsByStratumIdsStub = sinon
        .stub(SampleStratumRepository.prototype, 'deleteSampleStratumRecordsByStratumIds')
        .resolves(mockSampleStratumRecords);

      const surveyStratumId = [1];
      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.deleteSampleStratumRecordsByStratumIds(surveyStratumId);

      expect(deleteSampleStratumRecordsByStratumIdsStub).to.be.calledOnceWith(surveyStratumId);
      expect(response).to.eql(mockSampleStratumRecords);
    });
  });

  describe('insertSampleStratum', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('inserts sample stratums', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleStratumRecord: SampleStratumRecord = {
        survey_sample_stratum_id: 1,
        survey_sample_site_id: 2,
        survey_stratum_id: 3,
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSampleStratumStub = sinon
        .stub(SampleStratumRepository.prototype, 'insertSampleStratum')
        .resolves(mockSampleStratumRecord);

      const sampleStratum: InsertSampleStratumRecord = {
        survey_sample_site_id: 2,
        survey_stratum_id: 3
      };

      const sampleStratumService = new SampleStratumService(mockDBConnection);
      const response = await sampleStratumService.insertSampleStratum(sampleStratum);

      expect(insertSampleStratumStub).to.be.calledOnceWith(sampleStratum);

      expect(response).to.eql(mockSampleStratumRecord);
    });
  });

  describe('deleteSampleStratumsNotInArray', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();

      const survey_sample_stratum_id = 1;

      const mockSampleStratumRecord: SampleStratumRecord = {
        survey_sample_stratum_id: survey_sample_stratum_id,
        survey_sample_site_id: 1,
        survey_stratum_id: 3,
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };

      const mockSampleStratumRecords: SampleStratumRecord[] = [mockSampleStratumRecord];
      const getSampleStratumsForSurveySampleSiteIdStub = sinon
        .stub(SampleStratumRepository.prototype, 'getSampleStratumsForSurveySampleSiteId')
        .resolves(mockSampleStratumRecords);

      const deleteSampleStratumRecordsNotInArrayStub = sinon
        .stub(SampleStratumService.prototype, 'deleteSampleStratumsNotInArray')
        .resolves();

      const surveySampleSiteId = 1;

      const sampleStratumService = new SampleStratumService(mockDBConnection);

      await sampleStratumService.deleteSampleStratumsNotInArray(surveySampleSiteId, [
        { survey_sample_stratum_id: survey_sample_stratum_id } as UpdateSampleStratumRecord
      ]);
      await sampleStratumService.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);

      expect(getSampleStratumsForSurveySampleSiteIdStub).to.be.calledOnceWith(surveySampleSiteId);
      expect(deleteSampleStratumRecordsNotInArrayStub).to.be.calledOnceWith(mockSampleStratumRecord.survey_sample_stratum_id);
    });
  });
});
