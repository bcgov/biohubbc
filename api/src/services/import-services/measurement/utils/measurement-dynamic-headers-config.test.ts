import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { v4 } from 'uuid';
import { CSVParams, CSVRowState } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../../utils/nested-record';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../../critterbase-service';
import { getQualitativeMeasurementFromRowState } from '../../utils/row-state';
import {
  getDynamicMeasurementCellValidator,
  measurementDynamicHeaderDependencies as measurement,
  TSNMeasurementDictionary,
  validateQualitativeMeasurementCell,
  validateQuantitativeMeasurementCell
} from './measurement-dynamic-headers-config';

chai.use(sinonChai);

describe('measurement-dynamic-headers-config', () => {
  beforeEach(() => {
    sinon.restore();
  });

  describe('getDynamicMeasurementCellValidator', () => {
    it('should return an empty array when the cell is undefined', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the taxon has no reference measurements', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: 'test' } as CSVParams);

      expect(result[0].error).to.contain('no reference measurements');
    });

    it('should return an error when the column header does not exist', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      tsnMeasurementDictionary.set({ path: [1, 'header'], value: { itis_tsn: 1 } as any });

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: 'test', header: 'bad' } as CSVParams);

      expect(result[0].error).to.contain("'bad' does not exist");
    });

    it('should call the qualitative measurement cell validator when the measurement is qualitative', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        options: [
          {
            qualitative_option_id: v4(),
            option_label: 'test'
          }
        ]
      } as CBQualitativeMeasurementTypeDefinition;

      tsnMeasurementDictionary.set({ path: [1, 'QUALITATIVE'], value: measurementDefinition });

      const validateQualitativeStub = sinon.stub(measurement, 'validateQualitativeMeasurementCell').returns([]);

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: 'test', header: 'QUALITATIVE', row: {} } as CSVParams);

      expect(validateQualitativeStub).to.have.been.calledOnce;

      expect(result).to.be.deep.equal([]);
    });

    it('should call the quantitative measurement cell validator when the measurement is quantitative', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        unit: 'kg'
      } as unknown as CBQuantitativeMeasurementTypeDefinition;

      tsnMeasurementDictionary.set({ path: [1, 'QUANTITATIVE'], value: measurementDefinition });

      const validateQuantitativeStub = sinon.stub(measurement, 'validateQuantitativeMeasurementCell').returns([]);

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: 1, header: 'QUANTITATIVE', row: {} } as CSVParams);

      expect(validateQuantitativeStub).to.have.been.calledOnce;

      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the measurement type is invalid', () => {
      const tsnMeasurementDictionary: TSNMeasurementDictionary = new NestedRecord();
      const getCritterTsn = () => 1;

      tsnMeasurementDictionary.set({ path: [1, 'INVALID'], value: {} as any });

      const validator = getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn);

      const result = validator({ cell: 'test', header: 'INVALID', row: {} } as CSVParams);

      expect(result[0].error).to.contain('Invalid measurement type');
    });
  });

  describe('validateQualitativeMeasurementCell', () => {
    it('should validate the qualitative measurement cell value successfully', () => {
      const params = {
        cell: 'test',
        row: {},
        header: 'QUALITATIVE'
      } as CSVParams;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        options: [
          {
            qualitative_option_id: v4(),
            option_label: 'test'
          }
        ]
      } as CBQualitativeMeasurementTypeDefinition;

      const result = validateQualitativeMeasurementCell(params, measurementDefinition);

      expect(result).to.be.deep.equal([]);

      expect(getQualitativeMeasurementFromRowState(params.row[CSVRowState]?.QUALITATIVE)).to.deep.equal({
        taxon_measurement_id: measurementDefinition.taxon_measurement_id,
        qualitative_option_id: measurementDefinition.options[0].qualitative_option_id
      });
    });

    it('should return an error when the cell value is not a valid option', () => {
      const params = {
        cell: 'invalid',
        row: {},
        header: 'QUALITATIVE'
      } as CSVParams;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        options: [
          {
            qualitative_option_id: v4(),
            option_label: 'test'
          }
        ]
      } as CBQualitativeMeasurementTypeDefinition;

      const result = validateQualitativeMeasurementCell(params, measurementDefinition);

      expect(result).to.be.an('array').with.length(1);
    });
  });

  describe('validateQuantitativeMeasurementCell', () => {
    it('should validate the quantitative measurement cell value successfully', () => {
      const params = {
        cell: 1,
        row: {},
        header: 'QUANTITATIVE'
      } as CSVParams;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        min_value: 0,
        max_value: 10
      } as CBQuantitativeMeasurementTypeDefinition;

      const result = validateQuantitativeMeasurementCell(params, measurementDefinition);

      expect(result).to.be.deep.equal([]);

      expect(params.row[CSVRowState]?.QUANTITATIVE).to.deep.equal({
        taxon_measurement_id: measurementDefinition.taxon_measurement_id,
        value: params.cell
      });
    });

    it('should return an error when the cell value is not valid', () => {
      const params = {
        cell: 11,
        row: {},
        header: 'QUANTITATIVE'
      } as CSVParams;

      const measurementDefinition = {
        taxon_measurement_id: v4(),
        min_value: 0,
        max_value: 10
      } as CBQuantitativeMeasurementTypeDefinition;

      const result = validateQuantitativeMeasurementCell(params, measurementDefinition);

      expect(result).to.be.an('array').with.length(1);
    });
  });
});
