import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportSamplingStrategy } from './export-sampling-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportSamplingStrategy = new ExportSamplingStrategy(config, connection);

      const result = await exportSamplingStrategy.getExportStrategyConfig();

      expect(result.queries?.length).to.equal(3);
      expect(result.queries?.[0].fileName).to.equal('periods.csv');
      expect(result.queries?.[1].fileName).to.equal('sites.csv');
      expect(result.queries?.[2].fileName).to.equal('techniques.csv');
    });
  });
});
