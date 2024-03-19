import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSampleMethodRecord,
  SampleMethodRecord,
  SampleMethodRepository,
  UpdateSampleMethodRecord
} from '../repositories/sample-method-repository';
import { SamplePeriodRecord } from '../repositories/sample-period-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ObservationService } from './observation-service';
import { SampleMethodService } from './sample-method-service';
import { SamplePeriodService } from './sample-period-service';

chai.use(sinonChai);

describe('SampleMethodService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const sampleMethodService = new SampleMethodService(mockDBConnection);

    expect(sampleMethodService).to.be.instanceof(SampleMethodService);
  });

  describe('getSampleMethodsForSurveySampleSiteId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets a sample method by survey sample site ID', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecords: SampleMethodRecord[] = [
        {
          survey_sample_method_id: 1,
          survey_sample_site_id: 2,
          method_lookup_id: 3,
          method_response_metric_id: 1,
          description: 'description',
          create_date: '2023-05-06',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0
        }
      ];
      const getSampleMethodsForSurveySampleSiteIdStub = sinon
        .stub(SampleMethodRepository.prototype, 'getSampleMethodsForSurveySampleSiteId')
        .resolves(mockSampleMethodRecords);

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const sampleMethodService = new SampleMethodService(mockDBConnection);

      const response = await sampleMethodService.getSampleMethodsForSurveySampleSiteId(
        mockSurveyId,
        surveySampleSiteId
      );

      expect(getSampleMethodsForSurveySampleSiteIdStub).to.be.calledOnceWith(surveySampleSiteId);
      expect(response).to.eql(mockSampleMethodRecords);
    });
  });

  describe('deleteSampleMethodRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Deletes a sample method successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSurveyId = 1001;
      const mockSamplePeriodId = 1;
      const mockSampleMethodId = 1;

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const deleteSampleMethodRecordStub = sinon
        .stub(SampleMethodRepository.prototype, 'deleteSampleMethodRecord')
        .resolves(mockSampleMethodRecord);

      sinon
        .stub(SamplePeriodService.prototype, 'getSamplePeriodsForSurveyMethodId')
        .resolves([{ survey_sample_period_id: mockSamplePeriodId } as SamplePeriodRecord]);
      const deleteSamplePeriodRecordStub = sinon
        .stub(SamplePeriodService.prototype, 'deleteSamplePeriodRecords')
        .resolves();

      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.deleteSampleMethodRecord(mockSurveyId, mockSamplePeriodId);

      expect(deleteSampleMethodRecordStub).to.be.calledOnceWith(mockSurveyId, mockSampleMethodId);
      expect(deleteSamplePeriodRecordStub).to.be.calledOnceWith(mockSurveyId, [mockSamplePeriodId]);
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });

  describe('insertSampleMethod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Inserts a sample method successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSampleMethodStub = sinon
        .stub(SampleMethodRepository.prototype, 'insertSampleMethod')
        .resolves(mockSampleMethodRecord);

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-04',
        end_date: '2023-11-05',
        start_time: '12:00:00',
        end_time: '13:00:00',
        create_date: '2023-01-02',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSamplePeriodStub = sinon
        .stub(SamplePeriodService.prototype, 'insertSamplePeriod')
        .resolves(mockSamplePeriodRecord);

      const sampleMethod: InsertSampleMethodRecord = {
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          }
        ]
      };
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.insertSampleMethod(sampleMethod);

      expect(insertSampleMethodStub).to.be.calledOnceWith(sampleMethod);
      expect(insertSamplePeriodStub).to.be.calledWith({
        survey_sample_method_id: mockSampleMethodRecord.survey_sample_method_id,
        start_date: sampleMethod.periods[0].start_date,
        end_date: sampleMethod.periods[0].end_date,
        start_time: sampleMethod.periods[0].start_time,
        end_time: sampleMethod.periods[0].end_time
      });
      expect(insertSamplePeriodStub).to.be.calledWith({
        survey_sample_method_id: mockSampleMethodRecord.survey_sample_method_id,
        start_date: sampleMethod.periods[1].start_date,
        end_date: sampleMethod.periods[1].end_date,
        start_time: sampleMethod.periods[1].start_time,
        end_time: sampleMethod.periods[1].end_time
      });
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });

  describe('updateSampleMethod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Updates a sample method successfully', async () => {
      const mockDBConnection = getMockDBConnection();
      
      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const updateSampleMethodStub = sinon
        .stub(SampleMethodRepository.prototype, 'updateSampleMethod')
        .resolves(mockSampleMethodRecord);

      sinon.stub(SamplePeriodService.prototype, 'deleteSamplePeriodsNotInArray').resolves();
      sinon.stub(SamplePeriodService.prototype, 'updateSamplePeriod').resolves();
      sinon.stub(SamplePeriodService.prototype, 'insertSamplePeriod').resolves();

      const mockSurveyId = 1;
      const sampleMethod: UpdateSampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1,
            survey_sample_period_id: 4
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          } as SamplePeriodRecord
        ]
      };
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.updateSampleMethod(mockSurveyId, sampleMethod);

      expect(updateSampleMethodStub).to.be.calledOnceWith(mockSurveyId, sampleMethod);
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });

  describe('deleteSampleMethodsNotInArray', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should successfully delete sample methods not in array', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSurveyId = 1001;
      const mockSampleMethodId = 1;
      const surveySampleSiteId = 1;

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: mockSampleMethodId,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };

      const mockSampleMethodRecords: SampleMethodRecord[] = [mockSampleMethodRecord];
      const getSampleMethodsForSurveySampleSiteIdStub = sinon
        .stub(SampleMethodRepository.prototype, 'getSampleMethodsForSurveySampleSiteId')
        .resolves(mockSampleMethodRecords);

      const deleteSampleMethodRecordStub = sinon
        .stub(SampleMethodService.prototype, 'deleteSampleMethodRecord')
        .resolves();

      const getObservationsCountBySampleMethodIdsStub = sinon
        .stub(ObservationService.prototype, 'getObservationsCountBySampleMethodIds')
        .resolves(0);

      const sampleMethodService = new SampleMethodService(mockDBConnection);

      await sampleMethodService.deleteSampleMethodsNotInArray(mockSurveyId, surveySampleSiteId, [
        { survey_sample_method_id: 2 } as UpdateSampleMethodRecord
      ]);

      expect(getSampleMethodsForSurveySampleSiteIdStub).to.be.calledOnceWith(1001, surveySampleSiteId);

      expect(deleteSampleMethodRecordStub).to.be.calledOnceWith(
        mockSurveyId,
        mockSampleMethodRecord.survey_sample_method_id
      );
      expect(getObservationsCountBySampleMethodIdsStub).to.be.calledOnceWith([mockSampleMethodId]);
    });
  });
});
