import { OpenAPIV3 } from 'openapi-types';
import { techniqueSimpleViewSchema } from './technique';

export const SampleLocationSchema: OpenAPIV3.SchemaObject = {
  type: 'array',
  description: 'Sample location response object (includes sites, techniques, periods, stratums, blocks).',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geometry_type'],
    properties: {
      survey_sample_site_id: {
        type: 'integer',
        minimum: 1
      },
      survey_id: {
        type: 'integer',
        minimum: 1
      },
      name: {
        type: 'string',
        maxLength: 50
      },
      description: {
        type: 'string',
        maxLength: 250
      },
      geometry_type: {
        type: 'string',
        maxLength: 50
      },
      sample_methods: {
        type: 'array',
        required: [
          'survey_sample_method_id',
          'survey_sample_site_id',
          'technique',
          'method_response_metric_id',
          'sample_periods'
        ],
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            survey_sample_method_id: {
              type: 'integer',
              minimum: 1
            },
            survey_sample_site_id: {
              type: 'integer',
              minimum: 1
            },
            technique: techniqueSimpleViewSchema,
            method_response_metric_id: {
              type: 'integer',
              minimum: 1
            },
            description: {
              type: 'string',
              maxLength: 250
            },
            sample_periods: {
              type: 'array',
              required: [
                'survey_sample_period_id',
                'survey_sample_method_id',
                'start_date',
                'start_time',
                'end_date',
                'end_time'
              ],
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  survey_sample_period_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  survey_sample_method_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  start_date: {
                    type: 'string'
                  },
                  start_time: {
                    type: 'string',
                    nullable: true
                  },
                  end_date: {
                    type: 'string'
                  },
                  end_time: {
                    type: 'string',
                    nullable: true
                  }
                }
              }
            }
          }
        }
      },
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['survey_sample_block_id', 'survey_sample_site_id', 'survey_block_id'],
          properties: {
            survey_sample_block_id: {
              type: 'number'
            },
            survey_sample_site_id: {
              type: 'number'
            },
            survey_block_id: {
              type: 'number'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          }
        }
      },
      stratums: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['survey_sample_stratum_id', 'survey_sample_site_id', 'survey_stratum_id'],
          properties: {
            survey_sample_stratum_id: {
              type: 'number'
            },
            survey_sample_site_id: {
              type: 'number'
            },
            survey_stratum_id: {
              type: 'number'
            },
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            }
          }
        }
      }
    }
  }
};
