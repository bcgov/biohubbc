import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertSamplePeriodObject,
  SamplePeriodRepository,
  UpdateSamplePeriodObject
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

  describe('deleteSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Deletes a sample period record', async () => {
      const mockDBConnection = getMockDBConnection();

      const deleteSamplePeriodStub = sinon.stub(SamplePeriodRepository.prototype, 'deleteSamplePeriod').resolves();

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;

      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      await samplePeriodService.deleteSamplePeriod(mockSurveyId, surveySamplePeriodId);

      expect(deleteSamplePeriodStub).to.be.calledOnceWith(surveySamplePeriodId);
    });
  });

  describe('deleteSamplePeriods', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Deletes a sample period record', async () => {
      const mockDBConnection = getMockDBConnection();

      const deleteSamplePeriodsStub = sinon.stub(SamplePeriodRepository.prototype, 'deleteSamplePeriods').resolves();

      const mockSurveyId = 1;
      const surveySamplePeriodIds = [1, 2];

      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      await samplePeriodService.deleteSamplePeriods(mockSurveyId, surveySamplePeriodIds);

      expect(deleteSamplePeriodsStub).to.be.calledOnceWith(mockSurveyId, surveySamplePeriodIds);
    });
  });

  describe('insertSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Inserts a sample period successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const insertSamplePeriodStub = sinon.stub(SamplePeriodRepository.prototype, 'insertSamplePeriod').resolves();

      const surveyId = 1;
      const samplePeriods: InsertSamplePeriodObject[] = [
        {
          survey_sample_site_id: 2,
          method_technique_id: 3,
          start_date: '2023-10-02',
          end_date: '2023-01-02',
          start_time: '12:00:00',
          end_time: '13:00:00'
        }
      ];
      const samplePeriodService = new SamplePeriodService(mockDBConnection);
      await samplePeriodService.insertSamplePeriods(surveyId, samplePeriods);

      expect(insertSamplePeriodStub).to.be.calledOnceWith(1, samplePeriods[0]);
    });
  });

  describe('updateSamplePeriod', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('Updates a sample period successfully', async () => {
      const mockDBConnection = getMockDBConnection();

      const updateSamplePeriodStub = sinon.stub(SamplePeriodRepository.prototype, 'updateSamplePeriod').resolves();

      const samplePeriod: UpdateSamplePeriodObject = {
        survey_sample_period_id: 2,
        survey_id: 4,
        survey_sample_site_id: 1,
        method_technique_id: 3,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };

      const mockSurveyId = 1001;

      const samplePeriodService = new SamplePeriodService(mockDBConnection);

      await samplePeriodService.updateSamplePeriod(mockSurveyId, samplePeriod);

      expect(updateSamplePeriodStub).to.be.calledOnceWith(mockSurveyId, samplePeriod);
    });
  });
});
