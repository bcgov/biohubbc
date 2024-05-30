import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import {
  CBMeasurementUnit,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import * as measurement_column_utils from './measurement-column-utils';

describe('measurement-column-utils', () => {
  describe('isMeasurementCBQualitativeTypeDefinition', () => {
    it('returns a CBQualitativeMeasurementTypeDefinition', () => {
      const item: CBQualitativeMeasurementTypeDefinition = {
        itis_tsn: 1,
        taxon_measurement_id: '',
        measurement_name: 'Cool measurement',
        measurement_desc: '',
        options: [
          {
            qualitative_option_id: '',
            option_label: '',
            option_value: 0,
            option_desc: ''
          }
        ]
      };
      const result = measurement_column_utils.isMeasurementCBQualitativeTypeDefinition(item);

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
      const result = measurement_column_utils.isMeasurementCBQualitativeTypeDefinition(item);
      expect(result).to.be.false;
    });
  });

  describe('getMeasurementFromTsnMeasurementTypeDefinitionMap', () => {
    it('finds no measurement and returns null', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
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
      const results = measurement_column_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('tsn', '', tsnMap);
      expect(results).to.be.null;
    });
    it('has measurements but no qualitative or quantitative  and returns null', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [],
          quantitative: []
        }
      };
      const results = measurement_column_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('123', '', tsnMap);
      expect(results).to.be.null;
    });

    it('finds a qualitative measurement', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'neck_girth',
              measurement_desc: '',
              options: [
                {
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
      const results = measurement_column_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap(
        '123',
        'neck_girth',
        tsnMap
      );
      expect(results).to.eql({
        itis_tsn: 123,
        taxon_measurement_id: 'taxon_1',
        measurement_name: 'neck_girth',
        measurement_desc: '',
        options: [
          {
            qualitative_option_id: 'option_1',
            option_label: 'Neck Girth',
            option_value: 0,
            option_desc: ''
          }
        ]
      });
    });

    it('finds a quantitative measurement', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'neck_girth',
              measurement_desc: '',
              options: [
                {
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
      const results = measurement_column_utils.getMeasurementFromTsnMeasurementTypeDefinitionMap('123', 'legs', tsnMap);
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

  describe('getTsnMeasurementTypeDefinitionMap', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('fetch definitions per tsn', async () => {
      const getTaxonMeasurementsStub = sinon
        .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
        .resolves({ qualitative: [], quantitative: [] });

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });
      const results = await measurement_column_utils.getTsnMeasurementTypeDefinitionMap(['tsn', 'tsn1'], service);

      expect(getTaxonMeasurementsStub).to.be.calledTwice;
      expect(results).to.eql({
        tsn: { qualitative: [], quantitative: [] },
        tsn1: { qualitative: [], quantitative: [] }
      });
    });

    it('throws when no measurements are fetched', async () => {
      sinon
        .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
        .resolves(null as unknown as { qualitative: []; quantitative: [] });

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });

      try {
        await measurement_column_utils.getTsnMeasurementTypeDefinitionMap(['tsn', 'tsn1'], service);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).contains('No measurements found for tsn: tsn');
      }
    });

    it('throws when critterbase is unavailable', async () => {
      sinon.stub(CritterbaseService.prototype, 'getTaxonMeasurements').rejects();

      const service = new CritterbaseService({ keycloak_guid: '', username: '' });

      try {
        await measurement_column_utils.getTsnMeasurementTypeDefinitionMap(['tsn', 'tsn1'], service);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).equals('Error connecting to the Critterbase API');
      }
    });
  });

  describe('validateMeasurements', () => {
    it('no data to validate return true', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
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
      const data: measurement_column_utils.IMeasurementDataToValidate[] = [];
      const results = measurement_column_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.true;
    });

    it('no measurements returns false', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
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
      const data: measurement_column_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '2',
          key: 'taxon_1',
          value: 'option_1'
        }
      ];
      const results = measurement_column_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.false;
    });

    it('data provided is valid', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
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
      const data: measurement_column_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '123',
          key: 'taxon_1',
          value: 'option_1'
        },
        {
          tsn: '123',
          key: 'taxon_2',
          value: 3
        }
      ];
      const results = measurement_column_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.true;
    });

    it('data provided, no measurements found, returns false', () => {
      const tsnMap: measurement_column_utils.TsnMeasurementTypeDefinitionMap = {
        '123': {
          qualitative: [
            {
              itis_tsn: 123,
              taxon_measurement_id: 'taxon_1',
              measurement_name: 'Neck Girth',
              measurement_desc: '',
              options: [
                {
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
      const data: measurement_column_utils.IMeasurementDataToValidate[] = [
        {
          tsn: '123',
          key: 'tax_1',
          value: 'option_1'
        },
        {
          tsn: '123',
          key: 'tax_2',
          value: 3
        }
      ];
      const results = measurement_column_utils.validateMeasurements(data, tsnMap);
      expect(results).to.be.false;
    });
  });
});
