import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExtendedDeploymentRecord } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { ImportTelemetryService } from './import-telemetry-service';

chai.use(sinonChai);

describe('ImportTelemetryService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getCSVConfig', () => {
    it('should return the CSVConfig for Telemetry', async () => {
      const connection = getMockDBConnection();
      const service = new ImportTelemetryService(connection, {}, 1);

      const getSurveyDeploymentsStub = sinon.stub(service.deploymentService, 'getDeploymentsForSurvey');
      const getVendorsStub = sinon.stub(service.codeRepository, 'getActiveTelemetryDeviceMakes');
      const getSurveyCritterAliasMapStub = sinon.stub(service.surveyCritterService, 'getSurveyCritterAliasMap');

      getSurveyDeploymentsStub.resolves([{ device_key: 'lotek:1234' } as ExtendedDeploymentRecord]);
      getVendorsStub.resolves([{ name: 'Lotek' } as any]);
      getSurveyCritterAliasMapStub.resolves(new Map());

      const config = await service.getCSVConfig();

      expect(getSurveyDeploymentsStub).to.have.been.calledOnceWithExactly(1);
      expect(getVendorsStub).to.have.been.calledOnceWithExactly();
      expect(config.staticHeadersConfig).to.have.keys(
        'SERIAL',
        'VENDOR',
        'ALIAS',
        'LATITUDE',
        'LONGITUDE',
        'DATE',
        'TIME'
      );
    });
  });

  describe('importCSVWorksheet', () => {
    it('should import the CSV worksheet', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportTelemetryService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);
      const bulkCreateStub = sinon.stub(service.telemetryVendorService, 'bulkCreateTelemetryInBatches').resolves();

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            SERIAL: 'uuid',
            VENDOR: 'lotek',
            LATITUDE: 1.234,
            LONGITUDE: 2.345,
            DATE: '2021-01-01',
            TIME: '12:00:00',
            [CSVRowState]: {}
          }
        ]
      });

      await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(bulkCreateStub).to.have.been.calledOnceWithExactly(1, [
        {
          deployment_id: 'uuid',
          latitude: 1.234,
          longitude: 2.345,
          acquisition_date: '2021-01-01 12:00:00',
          transmission_date: null
        }
      ]);
    });

    it('should return CSV Validation error if rows fail validation', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportTelemetryService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);

      const mockValidate = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [{ error: 'error', solution: 'solution', values: [], cell: 'A1', row: 1, header: 'SERIAL' }],
        rows: []
      });

      const errors = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(mockValidate).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(errors).to.deep.equal([
        { error: 'error', solution: 'solution', values: [], cell: 'A1', row: 1, header: 'SERIAL' }
      ]);
    });
  });
});
