import { expect } from 'chai';
import { CSVParams, CSVRowState } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getQualitativeMeasurementCellValidator,
  getQuantitativeMeasurementCellValidator
} from './measurement-header-configs';

describe('measurement-header-configs', () => {
  describe.only('getQuantitativeMeasurementCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const cellValidator = getQuantitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        min_value: 0,
        max_value: 100,
        unit: 'millimeter'
      });

      const result = cellValidator({ cell: 1, row: {} } as CSVParams);

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should update the state with the taxon measurement id and value', () => {
      const cellValidator = getQuantitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        min_value: 0,
        max_value: 100,
        unit: 'millimeter'
      });

      const params = { cell: 1, row: {}, header: 'MEASUREMENT' } as CSVParams;

      const result = cellValidator(params);

      expect(params.row[CSVRowState]?.MEASUREMENT.taxon_measurement_id).to.equal('taxonID');
      expect(params.row[CSVRowState]?.MEASUREMENT.value).to.equal(1);

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when not a number', () => {
      const cellValidator = getQuantitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        min_value: 0,
        max_value: 100,
        unit: 'millimeter'
      });

      const result = cellValidator({ cell: 'invalid' } as CSVParams);

      expect(result[0].error).to.contain('number');
    });

    it('should return an error when the value is too large', () => {
      const cellValidator = getQuantitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        min_value: 0,
        max_value: 100,
        unit: 'millimeter'
      });

      const result = cellValidator({ cell: 101, row: {} } as CSVParams);

      expect(result[0].error).to.contain('large');
    });

    it('should return an error when the value is too small', () => {
      const cellValidator = getQuantitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        min_value: 0,
        max_value: 100,
        unit: 'millimeter'
      });

      const result = cellValidator({ cell: -1, row: {} } as CSVParams);

      expect(result[0].error).to.contain('small');
    });
  });

  describe('getQualitativeMeasurementCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const cellValidator = getQualitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        options: [
          {
            qualitative_option_id: 'optionID',
            option_label: 'label',
            option_value: 1,
            option_desc: 'desc'
          }
        ]
      });

      const result = cellValidator({ cell: 'label', row: {} } as CSVParams);

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should update the state with the taxon measurement id and value', () => {
      const cellValidator = getQualitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        options: [
          {
            qualitative_option_id: 'optionID',
            option_label: 'label',
            option_value: 1,
            option_desc: 'desc'
          }
        ]
      });

      const params = { cell: 'label', row: {}, header: 'MEASUREMENT' } as CSVParams;

      const result = cellValidator(params);

      expect(params.row[CSVRowState]?.MEASUREMENT.taxon_measurement_id).to.equal('taxonID');
      expect(params.row[CSVRowState]?.MEASUREMENT.qualitative_measurement_id).to.equal('optionID');

      expect(result).to.be.an('array').that.is.empty;
    });

    it('should return an error when not a string', () => {
      const cellValidator = getQualitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        options: [
          {
            qualitative_option_id: 'optionID',
            option_label: 'label',
            option_value: 1,
            option_desc: 'desc'
          }
        ]
      });

      const result = cellValidator({ cell: 123 } as CSVParams);

      expect(result[0].error).to.contain('string');
    });

    it('should return an error when the option is not valid', () => {
      const cellValidator = getQualitativeMeasurementCellValidator({
        itis_tsn: 123,
        taxon_measurement_id: 'taxonID',
        measurement_name: 'name',
        measurement_desc: 'desc',
        options: [
          {
            qualitative_option_id: 'optionID',
            option_label: 'label',
            option_value: 1,
            option_desc: 'desc'
          }
        ]
      });

      const result = cellValidator({ cell: 'invalid' } as CSVParams);

      expect(result[0].error).to.contain('option');
    });
  });
});
