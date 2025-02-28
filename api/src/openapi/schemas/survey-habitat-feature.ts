import { OpenAPIV3 } from 'openapi-types';

/**
 * Defines the schema for a survey habitat feature object, used for inserting a new survey habitat feature record.
 */
export const insertHabitatFeatureSchema: OpenAPIV3.SchemaObject = {
  description: 'A survey habitat feature record to insert.',
  type: 'object',
  additionalProperties: false,
  required: ['habitat_feature_type_id', 'latitude', 'longitude', 'count', 'observed_date', 'observed_time'],
  properties: {
    habitat_feature_type_id: {
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      type: 'integer',
      minimum: 1
    },
    latitude: {
      type: 'number',
      nullable: true,
      minimum: -90,
      maximum: 90
    },
    longitude: {
      type: 'number',
      nullable: true,
      minimum: -180,
      maximum: 180
    },
    count: {
      type: 'integer'
    },
    observed_date: {
      type: 'string',
      nullable: true
    },
    observed_time: {
      type: 'string',
      nullable: true
    }
  }
};

/**
 * Defines the schema for a survey habitat feature object, used for updating an existing survey habitat feature record.
 */
export const updateHabitatFeatureSchema: OpenAPIV3.SchemaObject = {
  description: 'A survey habitat feature record to update.',
  type: 'object',
  additionalProperties: false,
  required: ['habitat_feature_type_id', 'latitude', 'longitude', 'count', 'observed_date', 'observed_time'],
  properties: {
    habitat_feature_type_id: {
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      type: 'integer',
      minimum: 1
    },
    latitude: {
      type: 'number',
      nullable: true,
      minimum: -90,
      maximum: 90
    },
    longitude: {
      type: 'number',
      nullable: true,
      minimum: -180,
      maximum: 180
    },
    count: {
      type: 'integer'
    },
    observed_date: {
      type: 'string',
      nullable: true
    },
    observed_time: {
      type: 'string',
      nullable: true
    }
  }
};

/**
 * A single survey habitat feature taxon object.
 */
export const surveyHabitatFeatureTaxonSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'survey_habitat_feature_taxon_id',
    'survey_habitat_feature_id',
    'itis_tsn',
    'itis_scientific_name',
    'comment'
  ],
  properties: {
    survey_habitat_feature_taxon_id: {
      type: 'integer',
      minimum: 1
    },
    survey_habitat_feature_id: {
      type: 'integer',
      minimum: 1
    },
    itis_tsn: {
      type: 'integer'
    },
    itis_scientific_name: {
      type: 'string'
    },
    comment: {
      type: 'string',
      nullable: true
    }
  }
};

/**
 * A single survey habitat feature object, with an array of survey habitat feature taxons.
 */
export const surveyHabitatFeatureWithTaxonsSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'survey_habitat_feature_id',
    'survey_id',
    'habitat_feature_type_id',
    'count',
    'latitude',
    'longitude',
    'observed_date',
    'observed_time'
  ],
  properties: {
    survey_habitat_feature_id: {
      type: 'integer',
      minimum: 1
    },
    survey_id: {
      type: 'integer',
      minimum: 1
    },
    habitat_feature_type_id: {
      type: 'integer',
      minimum: 1
    },
    count: {
      type: 'integer'
    },
    latitude: {
      type: 'number',
      nullable: true,
      minimum: -90,
      maximum: 90
    },
    longitude: {
      type: 'number',
      nullable: true,
      minimum: -180,
      maximum: 180
    },
    observed_date: {
      type: 'string',
      nullable: true
    },
    observed_time: {
      type: 'string',
      nullable: true
    },
    survey_habitat_feature_taxons: {
      type: 'array',
      items: surveyHabitatFeatureTaxonSchema
    }
  }
};

/**
 * An array of survey habitat feature objects.
 */
export const SurveyHabitatFeaturesWithTaxonsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: surveyHabitatFeatureWithTaxonsSchema
};

/**
 * Supplementary data for survey habitat feature objects.
 */
export const surveyHabitatFeaturesSupplementaryDataSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['count', 'habitatFeatureQuantitativeDefinition', 'habitatFeatureQualitativeDefinition'],
  properties: {
    count: {
      description: 'The total count of survey habitat features for the survey.',
      type: 'integer',
      minimum: 0
    },
    habitatFeatureQuantitativeDefinition: {
      description: 'All quantitative habitat feature definitions for the survey habitat features.',
      type: 'array',
      items: {
        description: 'A quantitative habitat feature definition, with possible min/max constraints.',
        type: 'object',
        additionalProperties: false,
        required: [
          'habitat_feature_quantitative_definition_id',
          'name',
          'description',
          'min',
          'max',
          'unit',
          'record_end_date'
        ],
        properties: {
          habitat_feature_quantitative_definition_id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string',
            nullable: true
          },
          min: {
            type: 'number',
            nullable: true
          },
          max: {
            type: 'number',
            nullable: true
          },
          unit: {
            type: 'string',
            nullable: true
          },
          record_end_date: {
            type: 'string',
            nullable: true
          }
        }
      }
    },
    habitatFeatureQualitativeDefinition: {
      description: 'All qualitative habitat feature definitions for the survey habitat features.',
      type: 'array',
      items: {
        description: 'A qualitative habitat feature definition, with array of valid options',
        type: 'object',
        additionalProperties: false,
        required: ['environment_qualitative_id', 'name', 'description', 'record_end_date', 'options'],
        properties: {
          habitat_feature_qualitative_definition_id: {
            type: 'string',
            format: 'uuid'
          },
          name: {
            type: 'string'
          },
          description: {
            type: 'string',
            nullable: true
          },
          record_end_date: {
            type: 'string',
            nullable: true
          },
          options: {
            description: 'Valid options for the qualitative habitat feature definition.',
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: [
                'habitat_feature_qualitative_definition_option_id',
                'habitat_feature_qualitative_definition_id',
                'name',
                'description'
              ],
              properties: {
                habitat_feature_qualitative_definition_option_id: {
                  type: 'string',
                  format: 'uuid'
                },
                habitat_feature_qualitative_definition_id: {
                  type: 'string',
                  format: 'uuid'
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string',
                  nullable: true
                },
                record_end_date: {
                  type: 'string',
                  nullable: true
                }
              }
            }
          }
        }
      }
    }
  }
};
