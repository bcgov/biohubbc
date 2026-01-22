import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { WorkSheet } from 'xlsx';
import * as csv from '../../../utils/csv-utils/csv-config-validation';
import { CSVConfig, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ImportDeviceService } from './import-device-service';

chai.use(sinonChai);

describe('ImportDeviceService', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getCSVConfig', () => {
    it('should return the CSVConfig for Device', async () => {
      const connection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const service = new ImportDeviceService(connection, worksheet, 1);

      const getVendorsStub = sinon.stub(service.codeRepository, 'getActiveTelemetryDeviceMakes');
      getVendorsStub.resolves([{ name: 'Lotek', description: 'Lotek', id: 10 }]);

      const config = await service.getCSVConfig();

      expect(getVendorsStub).to.have.been.calledOnceWithExactly();
      expect(config.staticHeadersConfig).to.have.keys('SERIAL', 'VENDOR', 'MODEL', 'COMMENT');
    });
  });

  describe('importCSVWorksheet', () => {
    it('should import the CSV worksheet', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportDeviceService(mockConnection, worksheet, surveyId);

      const mockCSVConfig = {} as CSVConfig;
      const mockGetConfig = sinon.stub(service, 'getCSVConfig').resolves(mockCSVConfig);

      const validateStub = sinon.stub(csv, 'validateCSVWorksheet').returns({
        errors: [],
        rows: [
          {
            SERIAL: '1234',
            VENDOR: 'lotek',
            MODEL: 'ModelX',
            COMMENT: 'Test device',
            [CSVRowState]: {}
          }
        ]
      });

      service.vendorNameToId = new Map([['lotek', 10]]);
      const createDeviceStub = sinon.stub(service.telemetryDeviceService, 'createDevice').resolves();

      const result = await service.importCSVWorksheet();

      expect(mockGetConfig).to.have.been.called;
      expect(validateStub).to.have.been.calledOnceWithExactly(worksheet, mockCSVConfig);
      expect(createDeviceStub).to.have.been.calledOnceWithExactly({
        survey_id: 1,
        serial: '1234',
        device_make_id: 10,
        model: 'ModelX',
        comment: 'Test device'
      });
      expect(result).to.deep.equal([]);
    });

    it('should return CSV Validation error if rows fail validation', async () => {
      const mockConnection = getMockDBConnection();
      const worksheet = {} as WorkSheet;
      const surveyId = 1;

      const service = new ImportDeviceService(mockConnection, worksheet, surveyId);

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
