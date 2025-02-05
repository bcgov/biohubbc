import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getMockDBConnection } from '../../../__mocks__/db';
import { SamplePeriodService } from '../../sample-period-service';
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
            SERIAL: 'uuid',
            VENDOR: 'lotek',
            LATITUDE: 1.234,
            LONGITUDE: 2.345,
            START_DATE: '2021-01-01',
            START_TIME: '12:00:00',
            END_DATE: '2021-01-01',
            END_TIME: null
          }
        ]
      });

      await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(samplePeriodCreateStub).to.have.been.calledOnceWithExactly(1, [
        {
          deployment_id: 'uuid',
          latitude: 1.234,
          longitude: 2.345,
          acquisition_date: '2021-01-01 12:00:00',
          transmission_date: null
        }
      ]);
    });
  });
});
