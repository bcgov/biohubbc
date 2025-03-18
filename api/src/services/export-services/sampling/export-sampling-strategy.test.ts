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
      // const getMeasurementsMapStub = sinon.stub(exportObservationStrategy, '_getMeasurementsMap').resolves(new Map());

      const result = await exportSamplingStrategy.getExportStrategyConfig();

      // expect(getMeasurementsMapStub).to.have.been.calledOnce;
      expect(result.queries?.length).to.equal(1);
      expect(result.queries?.[0].fileName).to.equal('periods.csv');
    });
  });
});
