import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { parseTimestampString } from '../export-utils';
import { ExportTelemetryStrategy } from './export-telemetry-strategy';

chai.use(sinonChai);

describe('ExportTelemetryStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportTelemetryStrategy = new ExportTelemetryStrategy(config, connection);

      const result = await exportTelemetryStrategy.getExportStrategyConfig();

      expect(result.queries?.length).to.equal(1);
      expect(result.queries?.[0].fileName).to.equal('telemetry.csv');
    });

    it('should return exception for export sampling strategy config', async () => {
      const connection = getMockDBConnection(); // Mocked DB connection
      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      // Create an instance of ExportTelemetryStrategy
      const exportTelemetryStrategy = new ExportTelemetryStrategy(config, connection);

      // Stub the method to throw an error
      const getSql = sinon.stub(exportTelemetryStrategy, '_getSql').throws(new Error('Test telemetry strategy error'));

      try {
        await exportTelemetryStrategy.getExportStrategyConfig();
        expect.fail('Expected error was not thrown');
      } catch (error) {
        expect(error).to.exist;
        expect((error as Error).message).to.equal('Test telemetry strategy error');
      } finally {
        getSql.restore();
      }

      // Check if getSql was called
      expect(getSql).to.have.been.calledOnce;
    });

    it('should transform the telemetry item into a CSV string correctly', () => {
      // test input item
      const item = {
        telemetry_id: '123',
        vendor: 'vectronic',
        serial: '123456',
        deployment_id: 'deployment123',
        latitude: 34.0522,
        longitude: -118.2437,
        acquisition_date: '2025-03-25 12:34:56.032-07'
      };

      // Stubbing dependencies
      const parseTimestampStringStub = sinon.stub({ parseTimestampString }, 'parseTimestampString');
      const getTelemetryDeviceKeyStub = sinon.stub({ getTelemetryDeviceKey }, 'getTelemetryDeviceKey');

      // Mock the return values for the stubbed functions
      parseTimestampStringStub.returns({ dateStr: '2025-03-25', timeStr: '12:34:56 PDT' });
      getTelemetryDeviceKeyStub.returns('vectronic:123456');

      // Call the method
      const result = ExportTelemetryStrategy.telemetryCsvTransformation(item);

      // The expected CSV string
      const expectedCsv = '123,vectronic:123456,deployment123,34.0522,-118.2437,2025-03-25,12:34:56 PDT';

      // Assert that the result matches the expected CSV
      expect(result).to.equal(expectedCsv);

      // Restore the original methods after the test
      sinon.restore();
    });
  });
});
