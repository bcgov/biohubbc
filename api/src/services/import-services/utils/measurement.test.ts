import { expect } from 'chai';
import sinon from 'sinon';
import {
  getTsnMeasurementDictionary,
  isCBQualitativeMeasurementStub,
  isCBQualitativeMeasurementTypeDefinition,
  isCBQuantitativeMeasurementStub,
  isCBQuantitativeMeasurementTypeDefinition
} from './measurement';

describe('measurement', () => {
  describe('getTsnMeasurementDictionary', () => {
    it('should get the tsn measurement dictionary', async () => {
      const measurements = {
        qualitative: [{ taxon_measurement_id: 'uuid1', measurement_name: 'qualitative' }],
        quantitative: [{ taxon_measurement_id: 'uuid2', measurement_name: 'quantitative' }]
      };

      const getMeasurementsStub = sinon.stub();

      getMeasurementsStub.resolves(measurements as any);

      const critterbaseServiceMock = {
        getTaxonMeasurements: getMeasurementsStub
      };

      const result = await getTsnMeasurementDictionary([1], critterbaseServiceMock as any);

      expect(getMeasurementsStub).to.have.been.calledOnceWith(1);
      expect(result.get(1, 'qualitative')?.measurement_name).to.equal('qualitative');
      expect(result.get(1, 'quantitative')?.measurement_name).to.equal('quantitative');
      expect(result.get(1, 'uuid1')?.measurement_name).to.equal('qualitative');
      expect(result.get(1, 'uuid2')?.measurement_name).to.equal('quantitative');
    });
  });

  describe('isCBQualitativeMeasurementStub', () => {
    it('should return true if the object is a qualitative measurement stub', () => {
      expect(isCBQualitativeMeasurementStub({ qualitative_option_id: 1, taxon_measurement_id: 1 })).to.be.true;
    });

    it('should return false if the object is not a qualitative measurement stub', () => {
      for (const value of [undefined, null, 1, 'string', [], { taxon_measurement_id: 1 }]) {
        expect(isCBQualitativeMeasurementStub(value)).to.be.false;
      }
    });
  });

  describe('isCBQuantitativeMeasurementStub', () => {
    it('should return true if the object is a quantitative measurement stub', () => {
      expect(isCBQuantitativeMeasurementStub({ value: 1, taxon_measurement_id: 1 })).to.be.true;
    });

    it('should return false if the object is not a quantitative measurement stub', () => {
      for (const value of [undefined, null, 1, 'string', [], { value: 1 }, { taxon_measurement_id: 1 }]) {
        expect(isCBQuantitativeMeasurementStub(value)).to.be.false;
      }
    });
  });

  describe('isCBQualitativeMeasurementTypeDefinition', () => {
    it('should return true if the object is a qualitative measurement type definition', () => {
      expect(
        isCBQualitativeMeasurementTypeDefinition({
          taxon_measurement_id: '1',
          options: [{ qualitative_option_id: '1', option_label: 'option' }]
        })
      ).to.be.true;
    });

    it('should return false if the object is not a qualitative measurement type definition', () => {
      for (const value of [undefined, null, 1, 'string', [], { measurement_name: 1 }]) {
        expect(isCBQualitativeMeasurementTypeDefinition(value)).to.be.false;
      }
    });
  });

  describe('isCBQuantitativeMeausurementTypeDefinition', () => {
    it('should return true if the object is a quantitative measurement type definition', () => {
      expect(
        isCBQuantitativeMeasurementTypeDefinition({
          taxon_measurement_id: '1',
          unit: 'm'
        })
      ).to.be.true;
    });

    it('should return false if the object is not a quantitative measurement type definition', () => {
      for (const value of [undefined, null, 1, 'string', [], { measurement_name: 1 }]) {
        expect(isCBQuantitativeMeasurementTypeDefinition(value)).to.be.false;
      }
    });
  });
});
