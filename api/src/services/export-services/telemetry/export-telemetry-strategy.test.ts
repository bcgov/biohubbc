import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
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

      expect(result.streams?.length).to.equal(1);
      expect(result.streams?.[0].fileName).to.equal('telemetry.json');
    });
  });
});
