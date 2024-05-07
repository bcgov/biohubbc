import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import xlsx from 'xlsx';
import {
  CBMeasurementUnit,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import * as worksheet_utils from './worksheet-utils';

describe('worksheet utils', () => {
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

  describe('getMeasurementFromTsnMeasurementTypeDefinitionMap', () => {
    it('finds no measurement and returns null', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const results = worksheet_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('tsn', '', tsnMap);
      expect(results).to.be.null;
    });
    it('has measurements but no qualitative or quantitative  and returns null', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [],
          quantitative: []
        }
      };
      const results = worksheet_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('123', '', tsnMap);
      expect(results).to.be.null;
    });

    it('finds a qualitative measurement', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const results = worksheet_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('123', 'neck_girth', tsnMap);
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
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const results = worksheet_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('123', 'legs', tsnMap);
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
    afterEach(() => {
      sinon.restore();
    });
    it('fetch definitions per tsn', async () => {
      const fetch = sinon
        .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
        .resolves({ qualitative: [], quantitative: [] });

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });
      const results = await worksheet_utils.getCBMeasurementsFromTSN(['tsn', 'tsn1'], service);
      expect(fetch).to.be.calledTwice;
      expect(results).to.eql({
        tsn: { qualitative: [], quantitative: [] },
        tsn1: { qualitative: [], quantitative: [] }
      });
    });

    it('throws when no measurements are fetched', async () => {
      const fetch = sinon
        .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
        .resolves(null as unknown as { qualitative: []; quantitative: [] });

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });

      try {
        await worksheet_utils.getCBMeasurementsFromTSN(['tsn', 'tsn1'], service);
        expect(fetch).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as Error).message).contains('No measurements found for tsn: tsn');
      }
    });

    it('throws when critterbase is unavailable', async () => {
      const fetch = sinon.stub(CritterbaseService.prototype, 'getTaxonMeasurements').rejects();

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });

      try {
        await worksheet_utils.getCBMeasurementsFromTSN(['tsn', 'tsn1'], service);
        expect(fetch).to.be.calledOnce;
        expect.fail();
      } catch (error) {
        expect((error as Error).message).contains('Error connecting to the Critterbase API:');
      }
    });
  });

  describe('isQualitativeValueValid', () => {
    it('qualitative measurement label value is valid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid('Hind Leg', measurement);
      expect(results).to.be.true;
    });
    it('qualitative measurement value is valid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid(0, measurement);
      expect(results).to.be.true;
    });
    it('qualitative measurement option id is valid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid('option_2', measurement);
      expect(results).to.be.true;
    });

    it('qualitative measurement label value is invalid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid('Hide Leg', measurement);
      expect(results).to.be.false;
    });
    it('qualitative measurement value is invalid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid(2, measurement);
      expect(results).to.be.false;
    });
    it('qualitative measurement option id is invalid', () => {
      const measurement: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_1',
            option_label: 'Hind Leg',
            option_value: 0,
            option_desc: ''
          },
          {
            taxon_measurement_id: 'taxon_1',
            qualitative_option_id: 'option_2',
            option_label: 'Front Leg',
            option_value: 1,
            option_desc: ''
          }
        ]
      };
      const results = worksheet_utils.isQualitativeValueValid('option_32', measurement);
      expect(results).to.be.false;
    });
  });

  describe('isQuantitativeValueValid', () => {
    describe('min max range set', () => {
      it('should be valid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: 1,
          max_value: 4,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(2, measurement);
        expect(results).to.be.true;
      });

      it('should be invalid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: 1,
          max_value: 4,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(5, measurement);
        expect(results).to.be.false;
      });
    });

    describe('min range set', () => {
      it('should be valid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: 1,
          max_value: null,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(100, measurement);
        expect(results).to.be.true;
      });

      it('should be invalid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: 2,
          max_value: null,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(1, measurement);
        expect(results).to.be.false;
      });
    });
    describe('max range set', () => {
      it('should be valid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: null,
          max_value: 10,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(10, measurement);
        expect(results).to.be.true;
      });

      it('should be invalid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: null,
          max_value: 1000,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(2000, measurement);
        expect(results).to.be.false;
      });
    });

    describe('no range set', () => {
      it('should be valid', () => {
        const measurement: CBQuantitativeMeasurementTypeDefinition = {
          itis_tsn: 123,
          taxon_measurement_id: 'taxon_2',
          measurement_name: 'legs',
          measurement_desc: '',
          min_value: null,
          max_value: null,
          unit: CBMeasurementUnit.Enum.centimeter
        };

        const results = worksheet_utils.isQuantitativeValueValid(10, measurement);
        expect(results).to.be.true;
      });
    });
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

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

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

      const mockWorksheet = {} as unknown as xlsx.WorkSheet;

      const getWorksheetHeaderssStub = sinon
        .stub(worksheet_utils, 'getWorksheetHeaders')
        .callsFake(() => ['SPECIES', 'COUNT', 'DATE', 'TIME', 'SOMETHING_LAT', 'LON']);

      const result = worksheet_utils.validateWorksheetHeaders(mockWorksheet, observationCSVColumnValidator);

      expect(getWorksheetHeaderssStub).to.be.calledOnce;
      expect(result).to.equal(false);
    });
  });

  describe('validateMeasurements', () => {
    it('no data to validate return true', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const data: worksheet_utils.IMeasurementDataToValidate[] = [];
      const results = worksheet_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.true;
    });

    it('no measurements returns false', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const data: worksheet_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '2',
          measurement_key: 'taxon_1',
          measurement_value: 'option_1'
        }
      ];
      const results = worksheet_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.false;
    });

    it('data provided is valid', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const data: worksheet_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '123',
          measurement_key: 'taxon_1',
          measurement_value: 'option_1'
        },
        {
          tsn: '123',
          measurement_key: 'taxon_2',
          measurement_value: 3
        }
      ];
      const results = worksheet_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.true;
    });

    it('data provided, no measurements found, returns false', () => {
      const tsnMap: worksheet_utils.TsnMeasurementTypeDefinitionMap = {
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
      const data: worksheet_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '123',
          measurement_key: 'tax_1',
          measurement_value: 'option_1'
        },
        {
          tsn: '123',
          measurement_key: 'tax_2',
          measurement_value: 3
        }
      ];
      const results = worksheet_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.false;
    });
  });
});
