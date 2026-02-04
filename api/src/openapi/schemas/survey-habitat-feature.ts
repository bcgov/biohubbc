import { OpenAPIV3 } from 'openapi-types';
import { GetPeriodResponseSchema } from './period';

/**
 * Defines the schema for a survey habitat feature object, used for inserting a new survey habitat feature record.
 */
export const InsertHabitatFeatureSchema: OpenAPIV3.SchemaObject = {
  description: 'A survey habitat feature record to insert.',
  type: 'object',
  additionalProperties: false,
  required: [
    'habitat_feature_type_id',
    'latitude',
    'longitude',
    'count',
    'observed_date',
    'observed_time',
    'survey_sample_period_id',
    'survey_habitat_feature_taxons'
  ],
  properties: {
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
    survey_sample_period_id: {
      type: 'number',
      nullable: true
    },
    survey_habitat_feature_taxons: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['itis_tsn', 'itis_scientific_name', 'comment'],
        properties: {
          itis_tsn: {
            type: 'integer',
            minimum: 1
          },
          itis_scientific_name: {
            type: 'string'
          },
          comment: {
            type: 'string',
            nullable: true
          }
        }
      }
    }
  }
};

/**
 * Defines the schema for a survey habitat feature object, used for updating an existing survey habitat feature record.
 */
export const UpdateHabitatFeatureSchema: OpenAPIV3.SchemaObject = {
  description: 'A survey habitat feature record to update.',
  type: 'object',
  additionalProperties: false,
  required: [
    'habitat_feature_type_id',
    'latitude',
    'longitude',
    'count',
    'observed_date',
    'observed_time',
    'survey_sample_period_id',
    'survey_habitat_feature_taxons'
  ],
  properties: {
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
    survey_sample_period_id: {
      type: 'number',
      nullable: true
    },
    survey_habitat_feature_taxons: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['itis_tsn', 'itis_scientific_name', 'comment'],
        properties: {
          itis_tsn: {
            type: 'integer',
            minimum: 1
          },
          itis_scientific_name: {
            type: 'string'
          },
          comment: {
            type: 'string',
            nullable: true
          }
        }
      }
    }
  }
};

/**
 * A single survey habitat feature taxon object.
 */
export const SurveyHabitatFeatureTaxonSchema: OpenAPIV3.SchemaObject = {
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
 * A single survey habitat feature object, with an array of survey habitat feature taxons, and sampling data.
 */
export const SurveyHabitatFeatureWithTaxonsAndSamplingSchema: OpenAPIV3.SchemaObject = {
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
    'observed_time',
    'survey_sample_site_id',
    'survey_sample_site_name',
    'method_technique_id',
    'method_technique_name',
    'survey_sample_period_id',
    'survey_sample_period_start_datetime',
    'survey_habitat_feature_taxons'
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
    survey_sample_site_id: {
      type: 'number',
      nullable: true
    },
    survey_sample_site_name: {
      type: 'string',
      nullable: true
    },
    method_technique_id: {
      type: 'number',
      nullable: true
    },
    method_technique_name: {
      type: 'string',
      nullable: true
    },
    survey_sample_period_id: {
      type: 'number',
      nullable: true
    },
    survey_sample_period_start_datetime: {
      type: 'string',
      nullable: true
    },
    survey_habitat_feature_taxons: {
      type: 'array',
      items: SurveyHabitatFeatureTaxonSchema
    }
  }
};

/**
 * An array of survey habitat feature objects.
 */
export const SurveyHabitatFeaturesWithTaxonsSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  items: SurveyHabitatFeatureWithTaxonsAndSamplingSchema
};

/**
 * Supplementary data for survey habitat feature objects.
 */
export const SurveyHabitatFeaturesSupplementaryDataSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: [
    'count',
    'habitatFeatureQuantitativeDefinitions',
    'habitatFeatureQualitativeDefinitions',
    'sampling_periods'
  ],
  properties: {
    count: {
      description: 'The total count of survey habitat features for the survey.',
      type: 'integer',
      minimum: 0
    },
    sampling_periods: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'survey_sample_period_id',
          'survey_id',
          'survey_sample_site_id',
          'method_technique_id',
          'start_date',
          'start_time',
          'end_date',
          'end_time',
          'method_technique',
          'survey_sample_site'
        ],
        additionalProperties: false,
        properties: {
          survey_sample_period_id: {
            type: 'integer',
            minimum: 1
          },
          survey_id: {
            type: 'integer',
            minimum: 1
          },
          survey_sample_site_id: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          method_technique_id: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          start_date: {
            type: 'string',
            nullable: true
          },
          start_time: {
            type: 'string',
            nullable: true
          },
          end_date: {
            type: 'string',
            nullable: true
          },
          end_time: {
            type: 'string',
            nullable: true
          },
          survey_sample_site: {
            type: 'object',
            required: ['survey_sample_site_id', 'name'],
            additionalProperties: false,
            properties: {
              survey_sample_site_id: {
                type: 'integer',
                minimum: 1
              },
              name: {
                type: 'string'
              }
            },
            nullable: true
          },
          method_technique: {
            type: 'object',
            description: 'Details about the technique of the survey sample period',
            required: ['method_technique_id', 'name', 'description', 'method_response_metric_id'],
            properties: {
              method_technique_id: {
                type: 'integer',
                minimum: 1,
                description: 'Primary key of the method technique record'
              },
              name: {
                type: 'string',
                description: 'Name of the method technique'
              },
              description: {
                type: 'string',
                description: 'Description of the method technique',
                nullable: true
              },
              method_response_metric_id: {
                type: 'integer',
                minimum: 1
              }
            },
            nullable: true
          }
        }
      }
    },
    habitatFeatureQuantitativeDefinitions: {
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
    habitatFeatureQualitativeDefinitions: {
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
    },
    samplePeriod: GetPeriodResponseSchema
  }
};
