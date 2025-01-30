import { expect } from 'chai';
import sinon from 'sinon';
import { getTsnMeasurementDictionary } from './measurement';

describe('measurement', () => {
  describe('_getTsnMeasurementDictionary', () => {
    it('should get the tsn measurement dictionary', async () => {
      const measurements = {
        qualitative: [{ measurement_name: 'qualitative' }],
        quantitative: [{ measurement_name: 'quantitative' }]
      };

      const getMeasurementsStub = sinon.stub();

      getMeasurementsStub.resolves(measurements as any);

      const critterbaseServiceMock = {
        getTaxonMeasurements: getMeasurementsStub
      };

      const result = await getTsnMeasurementDictionary([1], critterbaseServiceMock as any);

      expect(getMeasurementsStub).to.have.been.calledOnceWith('1');
      expect(result.get(1, 'qualitative')).to.deep.equal({ measurement_name: 'qualitative' });
      expect(result.get(1, 'quantitative')).to.deep.equal({ measurement_name: 'quantitative' });
    });
  });
});
