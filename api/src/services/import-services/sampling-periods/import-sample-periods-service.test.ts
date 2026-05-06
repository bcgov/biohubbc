import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { SamplePeriodService } from '../../sample-period-service';
import { SampleSiteService } from '../../sample-site-service';
import { TechniqueService } from '../../technique-service';
import { ImportSamplePeriodsService } from './import-sample-periods-service';

chai.use(sinonChai);

describe('import-sample-periods-service', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('importCSVWorksheet', () => {
    it('should import the CSV worksheet', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportSamplePeriodsService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);
      const samplePeriodCreateStub = sinon.stub(SamplePeriodService.prototype, 'insertSamplePeriods');

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            SAMPLE_SITE: 1,
            TECHNIQUE_NAME: 2,
            START_DATE: '2021-01-01',
            START_TIME: '12:00:00',
            END_DATE: '2021-01-01',
            END_TIME: null,
            [CSVRowState]: {}
          }
        ]
      });

      const result = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(samplePeriodCreateStub).to.have.been.calledOnceWithExactly(1, [
        {
          survey_sample_site_id: 1,
          method_technique_id: 2,
          start_date: '2021-01-01',
          start_time: '12:00:00',
          end_date: '2021-01-01',
          end_time: null
        }
      ]);

      expect(result).to.deep.equal([]);
    });

    it('should return errors if the CSV worksheet is invalid', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportSamplePeriodsService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);
      const samplePeriodCreateStub = sinon.stub(SamplePeriodService.prototype, 'insertSamplePeriods');

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [true] as any,
        rows: []
      });

      const result = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;

      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(samplePeriodCreateStub).to.not.have.been.called;
      expect(result).to.deep.equal([true]);
    });
  });

  describe('getCSVConfig', () => {
    it('should return the CSV config', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportSamplePeriodsService(mockConnection, worksheet, surveyId);

      const sampleSiteStub = sinon.stub(SampleSiteService.prototype, 'getSampleSitesForSurveyId').resolves([]);
      const methodTechniqueStub = sinon.stub(TechniqueService.prototype, 'getTechniquesForSurveyId').resolves([]);

      const config = await service.getCSVConfig();

      expect(sampleSiteStub).to.have.been.calledOnceWithExactly(1);
      expect(methodTechniqueStub).to.have.been.calledOnceWithExactly(1);

      expect(config.rowValidators).to.be.an('array').with.a.lengthOf(1);
      expect(config.staticHeadersConfig).to.have.keys(
        'SAMPLE_SITE',
        'TECHNIQUE_NAME',
        'START_DATE',
        'START_TIME',
        'END_DATE',
        'END_TIME'
      );
      expect(config.ignoreDynamicHeaders).to.be.false;
      expect(config.dynamicHeadersConfig).to.be.undefined;
    });
  });
});
