import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSamplePeriodRecord,
  SamplePeriodRecord,
  SamplePeriodRepository,
  UpdateSamplePeriodRecord
} from '../repositories/sample-period-repository';
import { getMockDBConnection } from '../__mocks__/db';
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

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecords: SamplePeriodRecord[] = [
        {
          survey_sample_period_id: 1,
          survey_sample_method_id: 2,
          start_date: '2023-10-02',
          end_date: '2023-01-02',
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

      const surveySampleMethodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.getSamplePeriodsForSurveyMethodId(surveySampleMethodId);

      expect(getSamplePeriodsForSurveyMethodIdStub).to.be.calledOnceWith(surveySampleMethodId);
      expect(response).to.eql(mockSamplePeriodRecords);
    });
  });

  describe('deleteSamplePeriodRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        create_date: '2023-05-06',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const deleteSamplePeriodRecordStub = sinon
        .stub(SamplePeriodRepository.prototype, 'deleteSamplePeriodRecord')
        .resolves(mockSamplePeriodRecord);

      const surveySamplePeriodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.deleteSamplePeriodRecord(surveySamplePeriodId);

      expect(deleteSamplePeriodRecordStub).to.be.calledOnceWith(surveySamplePeriodId);
      expect(response).to.eql(mockSamplePeriodRecord);
    });
  });

  describe('insertSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
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
        end_date: '2023-01-02'
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

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecord: SamplePeriodRecord = {
        survey_sample_period_id: 1,
        survey_sample_method_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
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
        end_date: '2023-01-02'
      };
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.updateSamplePeriod(samplePeriod);

      expect(updateSamplePeriodStub).to.be.calledOnceWith(samplePeriod);
      expect(response).to.eql(mockSamplePeriodRecord);
    });
  });

  describe('deleteSamplePeriodsNotInArray', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSamplePeriodRecords: SamplePeriodRecord[] = [
        {
          survey_sample_period_id: 1,
          survey_sample_method_id: 2,
          start_date: '2023-10-02',
          end_date: '2023-01-02',
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

      const surveySampleMethodId = 1;
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      const response = await samplePeriodService.deleteSamplePeriodsNotInArray(surveySampleMethodId, [
        { survey_sample_period_id: 2 } as SamplePeriodRecord
      ]);

      expect(getSamplePeriodsForSurveyMethodIdStub).to.be.calledOnceWith(surveySampleMethodId);
      expect(deleteSamplePeriodRecordsStub).to.be.calledOnceWith([mockSamplePeriodRecords[0].survey_sample_period_id]);
      expect(response).to.eql(undefined);
    });
  });
});
