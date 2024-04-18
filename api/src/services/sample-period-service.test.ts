import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSamplePeriodRecord,
  SamplePeriodHierarchyIds,
  SamplePeriodRecord,
  SamplePeriodRepository,
  UpdateSamplePeriodRecord
} from '../repositories/sample-period-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ObservationService } from './observation-service';
import { SamplePeriodService } from './sample-period-service';

chai.use(sinonChai);

describe('SamplePeriodService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const samplePeriodService = new SamplePeriodService(mockDBConnection);

    expect(samplePeriodService).to.be.instanceof(SamplePeriodService);
  });

  describe('getSamplePeriodsForSurveyMethodId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets a sample period by survey method ID', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecords: SamplePeriodRecord[] = [
        {
          survey_sample_period_id: 1,
          survey_sample_method_id: 2,
          start_date: '2023-10-02',
          end_date: '2023-01-02',
          start_time: '12:00:00',
          end_time: '13:00:00',
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSamplePeriodsForSurveyMethodIdStub = sinon
        .stub(SamplePeriodRepository.prototype, 'getSamplePeriodsForSurveyMethodId')
        .resolves(mockSamplePeriodRecords);

      const mockSurveyId = 1;
      const surveySampleMethodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.getSamplePeriodsForSurveyMethodId(mockSurveyId, surveySampleMethodId);

      expect(getSamplePeriodsForSurveyMethodIdStub).to.be.calledOnceWith(surveySampleMethodId);
      expect(response).to.eql(mockSamplePeriodRecords);
    });
  });

  describe('getSamplePeriodHierarchyIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets a sample period by survey method ID', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleHierarchyIds: SamplePeriodHierarchyIds = {
        survey_sample_site_id: 1,
        survey_sample_method_id: 2,
        survey_sample_period_id: 3
      };

      const getSamplePeriodHierarchyIdsStub = sinon
        .stub(SamplePeriodRepository.prototype, 'getSamplePeriodHierarchyIds')
        .resolves(mockSampleHierarchyIds);

      const surveyId = 1;
      const surveySamplePeriodId = 3;

      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.getSamplePeriodHierarchyIds(surveyId, surveySamplePeriodId);

      expect(getSamplePeriodHierarchyIdsStub).to.be.calledOnceWith(surveyId, surveySamplePeriodId);
      expect(response).to.eql(mockSampleHierarchyIds);
    });
  });

  describe('deleteSamplePeriodRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Deletes a sample period record', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const deleteSamplePeriodRecordStub = sinon
        .stub(SamplePeriodRepository.prototype, 'deleteSamplePeriodRecord')
        .resolves(mockSamplePeriodRecord);

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.deleteSamplePeriodRecord(mockSurveyId, surveySamplePeriodId);

      expect(deleteSamplePeriodRecordStub).to.be.calledOnceWith(surveySamplePeriodId);
      expect(response).to.eql(mockSamplePeriodRecord);
    });
  });

  describe('insertSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Inserts a sample period successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSamplePeriodStub = sinon
        .stub(SamplePeriodRepository.prototype, 'insertSamplePeriod')
        .resolves(mockSamplePeriodRecord);

      const samplePeriod: InsertSamplePeriodRecord = {
        survey_sample_method_id: 1,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.insertSamplePeriod(samplePeriod);

      expect(insertSamplePeriodStub).to.be.calledOnceWith(samplePeriod);
      expect(response).to.eql(mockSamplePeriodRecord);
    });
  });

  describe('updateSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Updates a sample period successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const updateSamplePeriodStub = sinon
        .stub(SamplePeriodRepository.prototype, 'updateSamplePeriod')
        .resolves(mockSamplePeriodRecord);

      const samplePeriod: UpdateSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const mockSurveyId = 1001;

      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.updateSamplePeriod(mockSurveyId, samplePeriod);

      expect(updateSamplePeriodStub).to.be.calledOnceWith(1001, samplePeriod);
      expect(response).to.eql(mockSamplePeriodRecord);
    });
  });

  describe('deleteSamplePeriodsNotInArray', () => {
    it('should delete sample sites not in array successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecords: SamplePeriodRecord[] = [
        {
          survey_sample_period_id: 1,
          survey_sample_method_id: 2,
          start_date: '2023-10-02',
          end_date: '2023-01-02',
          start_time: '12:00:00',
          end_time: '13:00:00',
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSamplePeriodsForSurveyMethodIdStub = sinon
        .stub(SamplePeriodRepository.prototype, 'getSamplePeriodsForSurveyMethodId')
        .resolves(mockSamplePeriodRecords);

      const deleteSamplePeriodRecordsStub = sinon
        .stub(SamplePeriodService.prototype, 'deleteSamplePeriodRecords')
        .resolves();

      const getObservationsCountBySamplePeriodIdStub = sinon
        .stub(ObservationService.prototype, 'getObservationsCountBySamplePeriodIds')
        .resolves(0);

      const mockSurveyId = 1001;
      const surveySampleMethodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.deleteSamplePeriodsNotInArray(mockSurveyId, surveySampleMethodId, [
        { survey_sample_period_id: 2 } as SamplePeriodRecord
      ]);

      expect(getSamplePeriodsForSurveyMethodIdStub).to.be.calledOnceWith(mockSurveyId, surveySampleMethodId);
      expect(deleteSamplePeriodRecordsStub).to.be.calledOnceWith(mockSurveyId, [
        mockSamplePeriodRecords[0].survey_sample_period_id
      ]);
      expect(response).to.eql(undefined);
      expect(getObservationsCountBySamplePeriodIdStub).to.be.calledOnceWith([
        mockSamplePeriodRecords[0].survey_sample_period_id
      ]);
    });
  });
});
