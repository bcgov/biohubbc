import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  ObservationAnalyticsResponse,
  ObservationCountByGroup,
  ObservationCountByGroupSQLResponse,
  ObservationCountByGroupWithMeasurements
} from '../models/observation-analytics';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { AnalyticsService } from './analytics-service';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';

chai.use(sinonChai);

describe('AnalyticsService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getObservationCountByGroup', () => {
    it('returns an array of observation count analytics records', async () => {
      const dbConnection = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnection);

      sinon.stub(AnalyticsRepository.prototype, 'getObservationCountByGroup').resolves([
        {
          row_count: 3,
          individual_count: 62,
          individual_percentage: 57.41,
          survey_sample_site_id: 4,
          survey_sample_period_id: 4,
          quant_measurements: {},
          qual_measurements: { '337f67fa-296d-43a9-88b2-ffdc77891aee': '61d1532d-b06e-4300-8da6-d195cc98f34e' }
        },
        {
          row_count: 2,
          individual_count: 46,
          individual_percentage: 42.59,
          survey_sample_site_id: 4,
          survey_sample_period_id: 4,
          quant_measurements: {},
          qual_measurements: { '337f67fa-296d-43a9-88b2-ffdc77891aee': 'dd9a1672-ac93-4598-b166-caad463ed6f2' }
        }
      ]);

      sinon.stub(CritterbaseService.prototype, 'getQualitativeMeasurementTypeDefinition').resolves([
        {
          taxon_measurement_id: '337f67fa-296d-43a9-88b2-ffdc77891aee',
          itis_tsn: 180692,
          measurement_name: 'antler configuration',
          measurement_desc: null,
          options: [
            {
              qualitative_option_id: '61d1532d-b06e-4300-8da6-d195cc98f34e',
              option_label: 'less than 3 points',
              option_value: 0,
              option_desc: null
            },
            {
              qualitative_option_id: 'dd9a1672-ac93-4598-b166-caad463ed6f2',
              option_label: 'more than 3 points',
              option_value: 1,
              option_desc: null
            }
          ]
        }
      ]);

      sinon.stub(CritterbaseService.prototype, 'getQuantitativeMeasurementTypeDefinition').resolves([]);

      const surveyIds = [4];
      const groupByColumns = ['survey_sample_site_id', 'survey_sample_period_id'];
      const groupByQuantitativeMeasurements: string[] = [];
      const groupByQualitativeMeasurements = ['337f67fa-296d-43a9-88b2-ffdc77891aee'];

      const response = await analyticsService.getObservationCountByGroup(
        surveyIds,
        groupByColumns,
        groupByQuantitativeMeasurements,
        groupByQualitativeMeasurements
      );

      const expectedResponse: ObservationAnalyticsResponse[] = [
        {
          row_count: 3,
          individual_count: 62,
          individual_percentage: 57.41,
          qualitative_measurements: [
            {
              option: { option_id: '61d1532d-b06e-4300-8da6-d195cc98f34e', option_label: 'less than 3 points' },
              taxon_measurement_id: '337f67fa-296d-43a9-88b2-ffdc77891aee',
              measurement_name: 'antler configuration'
            }
          ],
          quantitative_measurements: []
        },
        {
          row_count: 2,
          individual_count: 46,
          individual_percentage: 42.59,
          qualitative_measurements: [
            {
              option: { option_id: 'dd9a1672-ac93-4598-b166-caad463ed6f2', option_label: 'more than 3 points' },
              taxon_measurement_id: '337f67fa-296d-43a9-88b2-ffdc77891aee',
              measurement_name: 'antler configuration'
            }
          ],
          quantitative_measurements: []
        }
      ];

      expect(response).to.eql(expectedResponse);
    });
  });

  describe('_filterNonEmptyColumns', () => {
    it('returns an array of non-empty columns', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const columns = ['a', '', 'b', 'c', ''];

      const result = analyticsService._filterNonEmptyColumns(columns);

      expect(result).to.eql(['a', 'b', 'c']);
    });
  });

  describe('_fetchQualitativeDefinitions', () => {
    it('returns an array of qualitative measurement type definitions', async () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const mockQualitativeMeasurementTypeDefinitions: CBQualitativeMeasurementTypeDefinition[] = [
        {
          itis_tsn: 123456,
          taxon_measurement_id: '1',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          options: [
            {
              qualitative_option_id: '3',
              option_label: 'option_label',
              option_value: 0,
              option_desc: 'option_desc'
            }
          ]
        }
      ];

      sinon
        .stub(CritterbaseService.prototype, 'getQualitativeMeasurementTypeDefinition')
        .resolves(mockQualitativeMeasurementTypeDefinitions);

      const counts: ObservationCountByGroupSQLResponse[] = [
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          life_stage: 'adult',
          antler_length: 20,
          quant_measurements: {
            '1': 1
          },
          qual_measurements: {
            '2': '2'
          }
        }
      ];

      const result = await analyticsService._fetchQualitativeDefinitions(counts);

      expect(result).to.eql(mockQualitativeMeasurementTypeDefinitions);
    });
  });

  describe('_fetchQuantitativeDefinitions', () => {
    it('returns an array of quantitative measurement type definitions', async () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const mockQuantitativeMeasurementTypeDefinitions: CBQuantitativeMeasurementTypeDefinition[] = [
        {
          itis_tsn: 123456,
          taxon_measurement_id: '1',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          min_value: 1,
          max_value: 2,
          unit: 'millimeter'
        }
      ];

      sinon
        .stub(CritterbaseService.prototype, 'getQuantitativeMeasurementTypeDefinition')
        .resolves(mockQuantitativeMeasurementTypeDefinitions);

      const counts: ObservationCountByGroupSQLResponse[] = [
        {
          row_count: 5,
          individual_count: 10,
          individual_percentage: 0.46,
          life_stage: 'adult',
          antler_length: 20,
          quant_measurements: {
            '1': 1
          },
          qual_measurements: {
            '2': '2'
          }
        }
      ];

      const result = await analyticsService._fetchQuantitativeDefinitions(counts);

      expect(result).to.eql(mockQuantitativeMeasurementTypeDefinitions);
    });
  });

  describe('_getQualitativeMeasurementIds', () => {
    it('returns an array of measurement IDs', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const counts: ObservationCountByGroupSQLResponse[] = [
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          life_stage: 'adult',
          antler_length: 20,
          quant_measurements: {
            '1': 1,
            '2': 2
          },
          qual_measurements: {
            '3': '3',
            '4': '4'
          }
        }
      ];

      const result = analyticsService._getQualitativeMeasurementIds(counts);

      expect(result).to.eql(['3', '4']);
    });
  });

  describe('_getQuantitativeMeasurementIds', () => {
    it('returns an array of measurement IDs', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const counts: ObservationCountByGroupSQLResponse[] = [
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          life_stage: 'adult',
          antler_length: 20,
          quant_measurements: {
            '1': 1,
            '2': 2
          },
          qual_measurements: {
            '3': '3',
            '4': '4'
          }
        }
      ];

      const result = analyticsService._getQuantitativeMeasurementIds(counts);

      expect(result).to.eql(['1', '2']);
    });
  });

  describe('_processCounts', () => {
    it('returns an array of observation analytics responses', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const counts: (ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[] = [
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          quant_measurements: [
            {
              critterbase_taxon_measurement_id: '1',
              value: 1
            }
          ],
          qual_measurements: [
            {
              critterbase_taxon_measurement_id: '2',
              option_id: '3'
            }
          ]
        }
      ];

      const qualitativeDefinitions: CBQualitativeMeasurementTypeDefinition[] = [];
      const quantitativeDefinitions: CBQuantitativeMeasurementTypeDefinition[] = [];

      const result = analyticsService._processCounts(counts, qualitativeDefinitions, quantitativeDefinitions);

      expect(result).to.be.an('array');
      expect(result.length).to.equal(1);
    });
  });

  describe('_mapQualitativeMeasurements', () => {
    it('returns an array of qualitative measurement analytics', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const qualMeasurements = [
        {
          critterbase_taxon_measurement_id: '11',
          option_id: '1'
        },
        {
          critterbase_taxon_measurement_id: '22',
          option_id: null
        }
      ];

      const definitions: CBQualitativeMeasurementTypeDefinition[] = [
        {
          itis_tsn: 123456,
          taxon_measurement_id: '11',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          options: [
            {
              qualitative_option_id: '1',
              option_label: 'option_label',
              option_value: 1,
              option_desc: 'option_desc'
            }
          ]
        },
        {
          itis_tsn: 123456,
          taxon_measurement_id: '22',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          options: [
            {
              qualitative_option_id: '2',
              option_label: 'option_label',
              option_value: 2,
              option_desc: 'option_desc'
            }
          ]
        }
      ];

      const result = analyticsService._mapQualitativeMeasurements(qualMeasurements, definitions);

      expect(result).to.eql([
        {
          taxon_measurement_id: '11',
          measurement_name: 'measurement_name',
          option: {
            option_id: '1',
            option_label: 'option_label'
          }
        }
      ]);
    });
  });

  describe('_mapQuantitativeMeasurements', () => {
    it('returns an array of quantitative measurement analytics', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const quantMeasurements = [
        {
          critterbase_taxon_measurement_id: '11',
          value: 1
        },
        {
          critterbase_taxon_measurement_id: '22',
          value: null
        }
      ];

      const definitions: CBQuantitativeMeasurementTypeDefinition[] = [
        {
          itis_tsn: 123456,
          taxon_measurement_id: '11',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          min_value: 1,
          max_value: 2,
          unit: 'millimeter'
        },
        {
          itis_tsn: 123456,
          taxon_measurement_id: '22',
          measurement_name: 'measurement_name',
          measurement_desc: 'measurement_desc',
          min_value: 1,
          max_value: 2,
          unit: 'centimeter'
        }
      ];

      const result = analyticsService._mapQuantitativeMeasurements(quantMeasurements, definitions);

      expect(result).to.eql([
        {
          taxon_measurement_id: '11',
          measurement_name: 'measurement_name',
          value: 1
        }
      ]);
    });
  });

  describe('_transformMeasurementObjectKeysToArrays', () => {
    it('returns an array of transformed observation counts', () => {
      const dbConnectionObj = getMockDBConnection();

      const analyticsService = new AnalyticsService(dbConnectionObj);

      const counts: ObservationCountByGroupSQLResponse[] = [
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          life_stage: 'adult',
          antler_length: 20,
          quant_measurements: {
            '1': 1
          },
          qual_measurements: {
            '2': '2'
          }
        }
      ];

      const result = analyticsService._transformMeasurementObjectKeysToArrays(counts);

      expect(result).to.eql([
        {
          row_count: 1,
          individual_count: 1,
          individual_percentage: 1,
          qual_measurements: [
            {
              critterbase_taxon_measurement_id: '2',
              option_id: '2'
            }
          ],
          quant_measurements: [
            {
              critterbase_taxon_measurement_id: '1',
              value: 1
            }
          ]
        }
      ]);
    });
  });
});
