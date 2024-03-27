import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import {
  CBMeasurementUnit,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../services/critterbase-service';
import * as worksheet_utils from './worksheet-utils';

describe.only('worksheet utils', () => {
  describe('isMeasurementCBQualitativeTypeDefinition', () => {});
  describe('isMeasurementCBQualitativeTypeDefinition', () => {
    it('returns a CBQualitativeMeasurementTypeDefinition', () => {
      const item: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: '',
            qualitative_option_id: '',
            option_label: '',
            option_value: 0,
            option_desc: ''
          }
        ]
      };
      const result = worksheet_utils.isMeasurementCBQualitativeTypeDefinition(item);

      expect(result).to.be.true;
    });
    it('returns a CBQuantitativeMeasurementTypeDefinition', () => {
      const item: CBQuantitativeMeasurementTypeDefinition = {
        itis_tsn: 111,
        taxon_measurement_id: '',
        measurement_name: '',
        measurement_desc: '',
        min_value: null,
        max_value: 500,
        unit: CBMeasurementUnit.Enum.centimeter
      };
      const result = worksheet_utils.isMeasurementCBQualitativeTypeDefinition(item);
      expect(result).to.be.false;
    });
  });

  describe('findMeasurementFromTsnMeasurements', () => {
    it('finds no measurement and returns null', () => {
      const tsnMap: worksheet_utils.TsnMeasurementMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
                  taxon_measurement_id: 'taxon_1_1',
                  qualitative_option_id: 'option_1',
                  option_label: 'Neck Girth',
                  option_value: 0,
                  option_desc: ''
                }
              ]
            }
          ],
          quantitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_2',
              measurement_name: 'legs',
              measurement_desc: '',
              min_value: null,
              max_value: 4,
              unit: CBMeasurementUnit.Enum.centimeter
            }
          ]
        }
      };
      const results = worksheet_utils.findMeasurementFromTsnMeasurements('tsn', '', tsnMap);
      expect(results).to.be.null;
    });
    it('has measurements but no qualitative or quantitative  and returns null', () => {
      const tsnMap: worksheet_utils.TsnMeasurementMap = {
        '123': {
          qualitative: [],
          quantitative: []
        }
      };
      const results = worksheet_utils.findMeasurementFromTsnMeasurements('123', '', tsnMap);
      expect(results).to.be.null;
    });

    it('finds a qualitative measurement', () => {
      const tsnMap: worksheet_utils.TsnMeasurementMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'neck_girth',
              measurement_desc: '',
              options: [
                {
                  taxon_measurement_id: 'taxon_1_1',
                  qualitative_option_id: 'option_1',
                  option_label: 'Neck Girth',
                  option_value: 0,
                  option_desc: ''
                }
              ]
            },
            {
              itis_tsn: 223,
              taxon_measurement_id: 'taxon_2',
              measurement_name: 'neck_size',
              measurement_desc: '',
              options: [
                {
                  taxon_measurement_id: 'taxon_2_1',
                  qualitative_option_id: 'option_2',
                  option_label: 'Big',
                  option_value: 0,
                  option_desc: ''
                }
              ]
            }
          ],
          quantitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_2',
              measurement_name: 'legs',
              measurement_desc: '',
              min_value: null,
              max_value: 4,
              unit: CBMeasurementUnit.Enum.centimeter
            }
          ]
        }
      };
      const results = worksheet_utils.findMeasurementFromTsnMeasurements('123', 'neck_girth', tsnMap);
      expect(results).to.eql({
        itis_tsn: 123,
        taxon_measurement_id: 'taxon_1',
        measurement_name: 'neck_girth',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1_1',
            qualitative_option_id: 'option_1',
            option_label: 'Neck Girth',
            option_value: 0,
            option_desc: ''
          }
        ]
      });
    });

    it('finds a quantitative measurement', () => {
      const tsnMap: worksheet_utils.TsnMeasurementMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'neck_girth',
              measurement_desc: '',
              options: [
                {
                  taxon_measurement_id: 'taxon_1_1',
                  qualitative_option_id: 'option_1',
                  option_label: 'Neck Girth',
                  option_value: 0,
                  option_desc: ''
                }
              ]
            },
            {
              itis_tsn: 223,
              taxon_measurement_id: 'taxon_2',
              measurement_name: 'neck_size',
              measurement_desc: '',
              options: [
                {
                  taxon_measurement_id: 'taxon_2_1',
                  qualitative_option_id: 'option_2',
                  option_label: 'Big',
                  option_value: 0,
                  option_desc: ''
                }
              ]
            }
          ],
          quantitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_2',
              measurement_name: 'legs',
              measurement_desc: '',
              min_value: null,
              max_value: 4,
              unit: CBMeasurementUnit.Enum.centimeter
            }
          ]
        }
      };
      const results = worksheet_utils.findMeasurementFromTsnMeasurements('123', 'legs', tsnMap);
      expect(results).to.eql({
        itis_tsn: 123,
        taxon_measurement_id: 'taxon_2',
        measurement_name: 'legs',
        measurement_desc: '',
        min_value: null,
        max_value: 4,
        unit: CBMeasurementUnit.Enum.centimeter
      });
    });
  });

  describe('getCBMeasurementsFromTSN', () => {
    it('', async () => {});
  });

  describe('validateWorksheetHeaders', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should validate aliases', () => {
      const observationCSVColumnValidator: worksheet_utils.IXLSXCSVValidator = {
        columnNames: ['SPECIES', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
        columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
        columnAliases: {
          LATITUDE: ['LAT'],
          LONGITUDE: ['LON', 'LONG', 'LNG'],
          SPECIES: ['TAXON']
        }
      };

      const mockWorksheet = ({} as unknown) as xlsx.WorkSheet;

      const getWorksheetHeaderssStub = sinon
        .stub(worksheet_utils, 'getWorksheetHeaders')
        .callsFake(() => ['TAXON', 'COUNT', 'DATE', 'TIME', 'LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getWorksheetHeaderssStub).to.be.calledOnce;
      expect(result).to.equal(true);
    });

    it('should fail for unknown aliases', () => {
      const observationCSVColumnValidator: worksheet_utils.IXLSXCSVValidator = {
        columnNames: ['SPECIES', 'COUNT', 'DATE', 'TIME', 'LATITUDE', 'LONGITUDE'],
        columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
        columnAliases: {
          LATITUDE: ['LAT'],
          LONGITUDE: ['LON', 'LONG', 'LNG']
        }
      };

      const mockWorksheet = ({} as unknown) as xlsx.WorkSheet;

      const getWorksheetHeaderssStub = sinon
        .stub(worksheet_utils, 'getWorksheetHeaders')
        .callsFake(() => ['SPECIES', 'COUNT', 'DATE', 'TIME', 'SOMETHING_LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getWorksheetHeaderssStub).to.be.calledOnce;
      expect(result).to.equal(false);
    });
  });
});
