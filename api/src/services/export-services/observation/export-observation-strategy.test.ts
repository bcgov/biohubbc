import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
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
      const getMeasurementsMapStub = sinon.stub(exportObservationStrategy, '_getMeasurementsMap').resolves(new Map());

      const result = await exportObservationStrategy.getExportStrategyConfig();

      expect(getMeasurementsMapStub).to.have.been.calledOnce;
      expect(result.queries?.length).to.equal(1);
      expect(result.queries?.[0].fileName).to.equal('observations.csv');
    });
  });
});
