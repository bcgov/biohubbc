import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../../__mocks__/db';
import { ExportObservationStrategy } from './export-observation-strategy';

chai.use(sinonChai);

describe('ExportObservationStrategy', () => {
  describe('getExportStrategyConfig', () => {
    it('should return the export strategy config', async () => {
      const connection = getMockDBConnection();

      const config = {
        surveyId: 1,
        isUserAdmin: true
      };

      const exportObservationStrategy = new ExportObservationStrategy(config, connection);

      const result = await exportObservationStrategy.getExportStrategyConfig();

      expect(result.queries?.length).to.equal(1);
      expect(result.queries?.[0].fileName).to.equal('observations.json');
    });
  });
});
