import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import {
  EnvironmentType,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-subcount-environment-repository';
import { ObservationSubCountEnvironmentService } from '../../services/observation-subcount-environment-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as environment_column_utils from './environment-column-utils';
import { EnvironmentNameTypeDefinitionMap, IEnvironmentDataToValidate } from './environment-column-utils';

describe.only('environment-column-utils', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getEnvironmentTypeDefinitionsFromColumnNames', async () => {
    const dbConnectionObj = getMockDBConnection();

    const findQualitativeEnvironmentTypeDefinitionsStub = sinon
      .stub(ObservationSubCountEnvironmentService.prototype, 'findQualitativeEnvironmentTypeDefinitions')
      .resolves([
        {
          environment_qualitative_id: 1,
          name: 'Wind Speed',
          description: 'Wind Speed',
          options: [
            {
              environment_qualitative_id: 2,
              environment_qualitative_option_id: 3,
              name: 'Low',
              description: 'Low'
            }
          ]
        },
        {
          environment_qualitative_id: 1,
          name: 'Wind Direction',
          description: 'Wind Direction',
          options: [
            {
              environment_qualitative_id: 4,
              environment_qualitative_option_id: 5,
              name: 'North',
              description: 'North'
            }
          ]
        }
      ]);

    const findQuantitativeEnvironmentTypeDefinitionsStub = sinon
      .stub(ObservationSubCountEnvironmentService.prototype, 'findQuantitativeEnvironmentTypeDefinitions')
      .resolves([
        {
          environment_quantitative_id: 6,
          name: 'Weight',
          description: 'Weight',
          min: 0,
          max: null,
          unit: 'kilogram'
        }
      ]);

    const columnNames: string[] = ['Wind Speed', 'Weight', 'Col With No Match', 'Wind Direction', 'Height'];
    const observationSubCountEnvironmentService: ObservationSubCountEnvironmentService =
      new ObservationSubCountEnvironmentService(dbConnectionObj);

    const result = await environment_column_utils.getEnvironmentTypeDefinitionsFromColumnNames(
      columnNames,
      observationSubCountEnvironmentService
    );

    expect(findQualitativeEnvironmentTypeDefinitionsStub).to.have.been.calledOnceWith(columnNames);
    expect(findQuantitativeEnvironmentTypeDefinitionsStub).to.have.been.calledOnceWith(columnNames);

    expect(result).to.eql({
      qualitative_environments: [
        {
          environment_qualitative_id: 1,
          name: 'Wind Speed',
          description: 'Wind Speed',
          options: [
            {
              environment_qualitative_id: 2,
              environment_qualitative_option_id: 3,
              name: 'Low',
              description: 'Low'
            }
          ]
        },
        {
          environment_qualitative_id: 1,
          name: 'Wind Direction',
          description: 'Wind Direction',
          options: [
            {
              environment_qualitative_id: 4,
              environment_qualitative_option_id: 5,
              name: 'North',
              description: 'North'
            }
          ]
        }
      ],
      quantitative_environments: [
        {
          environment_quantitative_id: 6,
          name: 'Weight',
          description: 'Weight',
          min: 0,
          max: null,
          unit: 'kilogram'
        }
      ]
    });
  });

  describe('getEnvironmentColumnsTypeDefinitionMap', () => {
    it('returns the column name definition map', () => {
      const environmentColumns: string[] = ['Wind Speed', 'Weight', 'Col With No Match', 'Wind Direction', 'Height'];
      const environmentTypeDefinitions: EnvironmentType = {
        qualitative_environments: [
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          },
          {
            environment_qualitative_id: 1,
            name: 'Wind Direction',
            description: 'Wind Direction',
            options: [
              {
                environment_qualitative_id: 4,
                environment_qualitative_option_id: 5,
                name: 'North',
                description: 'North'
              }
            ]
          }
        ],
        quantitative_environments: [
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: null,
            unit: 'kilogram'
          },
          {
            environment_quantitative_id: 7,
            name: 'Env With No Match',
            description: 'Env With No Match',
            min: 0,
            max: 100,
            unit: 'meter'
          },
          {
            environment_quantitative_id: 8,
            name: 'Height',
            description: 'Height',
            min: 0,
            max: null,
            unit: 'centimeter'
          }
        ]
      };

      const expectedResult = new Map<
        string,
        QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
      >([
        [
          'Wind Speed',
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          }
        ],
        [
          'Wind Direction',
          {
            environment_qualitative_id: 1,
            name: 'Wind Direction',
            description: 'Wind Direction',
            options: [
              {
                environment_qualitative_id: 4,
                environment_qualitative_option_id: 5,
                name: 'North',
                description: 'North'
              }
            ]
          }
        ],
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: null,
            unit: 'kilogram'
          }
        ],
        [
          'Height',
          {
            environment_quantitative_id: 8,
            name: 'Height',
            description: 'Height',
            min: 0,
            max: null,
            unit: 'centimeter'
          }
        ]
      ]);

      const result = environment_column_utils.getEnvironmentColumnsTypeDefinitionMap(
        environmentColumns,
        environmentTypeDefinitions
      );

      expect(result).to.eql(expectedResult);
    });
  });

  describe('validateEnvironments', () => {
    it('returns true when there are no environments to validate', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map();

      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.true;
    });

    it('returns true when the values match valid environment definitions', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Wind Speed',
          value: 'Low'
        },
        {
          key: 'Weight',
          value: 100
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Wind Speed',
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          }
        ],
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: null,
            unit: 'kilogram'
          }
        ]
      ]);

      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.true;
    });

    it('returns true when the values match valid environment definitions - with a stringified number', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Wind Speed',
          value: 'Low'
        },
        {
          key: 'Weight',
          value: '100'
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Wind Speed',
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          }
        ],
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: null,
            unit: 'kilogram'
          }
        ]
      ]);

      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.true;
    });

    it('returns false when a column name does not match any valid environment definitions', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Col With No Match',
          value: 'Low'
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Wind Speed',
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          }
        ]
      ]);
      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.false;
    });

    it('returns false when a qualitative option does not match any of the matching environment definitions options', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Wind Speed',
          value: 'Not A Valid Option'
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Wind Speed',
          {
            environment_qualitative_id: 1,
            name: 'Wind Speed',
            description: 'Wind Speed',
            options: [
              {
                environment_qualitative_id: 2,
                environment_qualitative_option_id: 3,
                name: 'Low',
                description: 'Low'
              }
            ]
          }
        ]
      ]);
      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.false;
    });

    it('returns false when a quantitative value is less than the environment definitions minimum', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Col With No Match',
          value: '-10'
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: 200,
            unit: 'kilogram'
          }
        ]
      ]);
      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.false;
    });

    it('returns false when a quantitative value is greater than the environment definitions maximum', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Col With No Match',
          value: 500
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: 0,
            max: 200,
            unit: 'kilogram'
          }
        ]
      ]);
      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.false;
    });

    it('returns false when a quantitative value is not a number', () => {
      const environmentsToValidate: IEnvironmentDataToValidate[] = [
        {
          key: 'Col With No Match',
          value: 'Not A Number'
        }
      ];
      const environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap = new Map([
        [
          'Weight',
          {
            environment_quantitative_id: 6,
            name: 'Weight',
            description: 'Weight',
            min: null,
            max: null,
            unit: 'kilogram'
          }
        ]
      ]);
      const results = environment_column_utils.validateEnvironments(
        environmentsToValidate,
        environmentNameTypeDefinitionMap
      );

      expect(results).to.be.false;
    });
  });

  describe('isEnvironmentQualitativeTypeDefinition', () => {
    it('returns true', () => {
      const item: QualitativeEnvironmentTypeDefinition = {
        environment_qualitative_id: 1,
        name: 'Wind speed',
        description: 'Wind speed',
        options: [
          {
            environment_qualitative_id: 2,
            environment_qualitative_option_id: 3,
            name: 'Low',
            description: 'Low'
          }
        ]
      };

      const result = environment_column_utils.isEnvironmentQualitativeTypeDefinition(item);

      expect(result).to.be.true;
    });

    it('returns false', () => {
      const item: QuantitativeEnvironmentTypeDefinition = {
        environment_quantitative_id: 1,
        name: 'Weight',
        description: 'Weight',
        min: 0,
        max: null,
        unit: 'kilogram'
      };

      const result = environment_column_utils.isEnvironmentQualitativeTypeDefinition(item);

      expect(result).to.be.false;
    });
  });
});
