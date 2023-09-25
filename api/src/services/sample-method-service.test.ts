import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostSampleMethod, SampleMethodRecord, SampleMethodRepository } from '../repositories/sample-method-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleMethodService } from './sample-method-service';
import { SamplePeriodService } from './sample-period-service';

chai.use(sinonChai);

describe.only('SampleMethodService', () => {
  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const sampleMethodService = new SampleMethodService(mockDBConnection);

    expect(sampleMethodService).to.be.instanceof(SampleMethodService);
  });

  describe('getSampleMethodsForSurveySampleSiteId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecords: SampleMethodRecord[] = [
        {
          survey_sample_method_id: 1,
          survey_sample_site_id: 2,
          method_lookup_id: 3,
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

      const surveyId = 1;
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.getSampleMethodsForSurveySampleSiteId(surveyId);

      expect(getSampleMethodsForSurveySampleSiteIdStub).to.be.calledOnceWith(surveyId);
      expect(response).to.eql(mockSampleMethodRecords);
    });
  });

  describe('deleteSampleMethodRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
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

      const surveyBlockId = 1;
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.deleteSampleMethodRecord(surveyBlockId);

      expect(deleteSampleMethodRecordStub).to.be.calledOnceWith(surveyBlockId);
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });

  describe('insertSampleMethod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
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

      const mockSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-04',
        end_date: '2023-11-05',
        create_date: '2023-01-02',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 0
      };
      const insertSamplePeriodStub = sinon
        .stub(SamplePeriodService.prototype, 'insertSamplePeriod')
        .resolves(mockSamplePeriodRecord);

      const sampleMethod: PostSampleMethod = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        description: 'description',
        periods: [
          { end_date: '2023-01-02', start_date: '2023-10-02', survey_sample_method_id: 1, survey_sample_period_id: 4 },
          { end_date: '2023-10-03', start_date: '2023-11-05', survey_sample_method_id: 1, survey_sample_period_id: 5 }
        ]
      };
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.insertSampleMethod(sampleMethod);

      expect(insertSampleMethodStub).to.be.calledOnceWith(sampleMethod);
      expect(insertSamplePeriodStub).to.be.calledWith({
        survey_sample_method_id: sampleMethod.survey_sample_method_id,
        start_date: sampleMethod.periods[0].start_date,
        end_date: sampleMethod.periods[0].end_date
      });
      expect(insertSamplePeriodStub).to.be.calledWith({
        survey_sample_method_id: sampleMethod.survey_sample_method_id,
        start_date: sampleMethod.periods[1].start_date,
        end_date: sampleMethod.periods[1].end_date
      });
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });

  describe('updateSampleMethod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Gets permit by admin user id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockSampleMethodRecord: SampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
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

      const sampleMethod: PostSampleMethod = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_lookup_id: 3,
        description: 'description',
        periods: [
          { end_date: '2023-01-02', start_date: '2023-10-02', survey_sample_method_id: 1, survey_sample_period_id: 4 },
          { end_date: '2023-10-03', start_date: '2023-11-05', survey_sample_method_id: 1, survey_sample_period_id: 5 }
        ]
      };
      const sampleMethodService = new SampleMethodService(mockDBConnection);
      const response = await sampleMethodService.updateSampleMethod(sampleMethod);

      expect(updateSampleMethodStub).to.be.calledOnceWith(sampleMethod);
      expect(response).to.eql(mockSampleMethodRecord);
    });
  });
});
