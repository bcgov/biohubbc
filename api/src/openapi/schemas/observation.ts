import { OpenAPIV3 } from 'openapi-types';
import { paginationResponseSchema } from './pagination';

export const observervationsWithSubcountDataSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  additionalProperties: false,
  required: ['surveyObservations', 'supplementaryObservationData', 'pagination'],
  properties: {
    surveyObservations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'survey_observation_id',
          'survey_id',
          'itis_tsn',
          'itis_scientific_name',
          'survey_sample_site_id',
          'survey_sample_method_id',
          'survey_sample_period_id',
          'latitude',
          'longitude',
          'count',
          'observation_date',
          'observation_time',
          'survey_sample_site_name',
          'survey_sample_method_name',
          'survey_sample_period_start_datetime'
        ],
        properties: {
          survey_observation_id: {
            type: 'integer',
            minimum: 1
          },
          survey_id: {
            type: 'integer',
            minimum: 1
          },
          itis_tsn: {
            type: 'integer'
          },
          itis_scientific_name: {
            type: 'string',
            nullable: true
          },
          survey_sample_site_id: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          survey_sample_method_id: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          survey_sample_period_id: {
            type: 'integer',
            minimum: 1,
            nullable: true
          },
          latitude: {
            type: 'number',
            nullable: true
          },
          longitude: {
            type: 'number',
            nullable: true
          },
          count: {
            type: 'integer'
          },
          observation_date: {
            type: 'string',
            nullable: true
          },
          observation_time: {
            type: 'string',
            nullable: true
          },
          survey_sample_site_name: {
            type: 'string',
            nullable: true
          },
          survey_sample_method_name: {
            type: 'string',
            nullable: true
          },
          survey_sample_period_start_datetime: {
            type: 'string',
            nullable: true
          },
          subcounts: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: [
                'observation_subcount_id',
                'subcount',
                'observation_subcount_sign_id',
                'comment',
                'qualitative_measurements',
                'quantitative_measurements',
                'qualitative_environments',
                'quantitative_environments'
              ],
              properties: {
                observation_subcount_id: {
                  type: 'integer'
                },
                observation_subcount_sign_id: {
                  type: 'integer',
                  minimum: 1,
                  description:
                    'The observation subcount sign ID, indicating whether the subcount was a direct sighting, footprints, scat, etc.'
                },
                comment: {
                  type: 'string',
                  nullable: true,
                  description: 'A comment or note about the subcount record.'
                },
                subcount: {
                  type: 'number'
                },
                qualitative_measurements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['critterbase_taxon_measurement_id', 'critterbase_measurement_qualitative_option_id'],
                    properties: {
                      critterbase_taxon_measurement_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      critterbase_measurement_qualitative_option_id: {
                        type: 'string',
                        format: 'uuid'
                      }
                    }
                  }
                },
                quantitative_measurements: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['critterbase_taxon_measurement_id', 'value'],
                    properties: {
                      critterbase_taxon_measurement_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      value: {
                        type: 'number'
                      }
                    }
                  }
                },
                qualitative_environments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: [
                      'observation_subcount_qualitative_environment_id',
                      'environment_qualitative_id',
                      'environment_qualitative_option_id'
                    ],
                    properties: {
                      observation_subcount_qualitative_environment_id: {
                        type: 'integer'
                      },
                      environment_qualitative_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      environment_qualitative_option_id: {
                        type: 'string',
                        format: 'uuid'
                      }
                    }
                  }
                },
                quantitative_environments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: [
                      'observation_subcount_quantitative_environment_id',
                      'environment_quantitative_id',
                      'value'
                    ],
                    properties: {
                      observation_subcount_quantitative_environment_id: {
                        type: 'integer'
                      },
                      environment_quantitative_id: {
                        type: 'string',
                        format: 'uuid'
                      },
                      value: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    supplementaryObservationData: {
      type: 'object',
      additionalProperties: false,
      required: [
        'observationCount',
        'qualitative_measurements',
        'quantitative_measurements',
        'qualitative_environments',
        'quantitative_environments'
      ],
      properties: {
        observationCount: {
          type: 'integer',
          minimum: 0
        },
        qualitative_measurements: {
          description: 'All qualitative measurement type definitions for the observations.',
          type: 'array',
          items: {
            description: 'A qualitative measurement type definition, with array of valid/accepted options',
            type: 'object',
            additionalProperties: false,
            required: ['itis_tsn', 'taxon_measurement_id', 'measurement_name', 'measurement_desc', 'options'],
            properties: {
              itis_tsn: {
                type: 'integer',
                nullable: true
              },
              taxon_measurement_id: {
                type: 'string'
              },
              measurement_name: {
                type: 'string'
              },
              measurement_desc: {
                type: 'string',
                nullable: true
              },
              options: {
                description: 'Valid options for the measurement.',
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['qualitative_option_id', 'option_label', 'option_value', 'option_desc'],
                  properties: {
                    qualitative_option_id: {
                      type: 'string'
                    },
                    option_label: {
                      type: 'string',
                      nullable: true
                    },
                    option_value: {
                      type: 'number'
                    },
                    option_desc: {
                      type: 'string',
                      nullable: true
                    }
                  }
                }
              }
            }
          }
        },
        quantitative_measurements: {
          description: 'All quantitative measurement type definitions for the observations.',
          type: 'array',
          items: {
            description: 'A quantitative measurement type definition, with possible min/max constraint.',
            type: 'object',
            additionalProperties: false,
            required: [
              'itis_tsn',
              'taxon_measurement_id',
              'measurement_name',
              'measurement_desc',
              'min_value',
              'max_value',
              'unit'
            ],
            properties: {
              itis_tsn: {
                type: 'integer',
                nullable: true
              },
              taxon_measurement_id: {
                type: 'string'
              },
              measurement_name: {
                type: 'string'
              },
              measurement_desc: {
                type: 'string',
                nullable: true
              },
              min_value: {
                type: 'number',
                nullable: true
              },
              max_value: {
                type: 'number',
                nullable: true
              },
              unit: {
                type: 'string',
                nullable: true
              }
            }
          }
        },
        qualitative_environments: {
          description: 'All qualitative environment type definitions for the observations.',
          type: 'array',
          items: {
            description: 'A qualitative environment type definition, with array of valid/accepted options',
            type: 'object',
            additionalProperties: false,
            required: ['environment_qualitative_id', 'name', 'description', 'options'],
            properties: {
              environment_qualitative_id: {
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
              options: {
                description: 'Valid options for the environment.',
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['environment_qualitative_option_id', 'environment_qualitative_id', 'name', 'description'],
                  properties: {
                    environment_qualitative_option_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    environment_qualitative_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    }
                  }
                }
              }
            }
          }
        },
        quantitative_environments: {
          description: 'All quantitative environment type definitions for the observations.',
          type: 'array',
          items: {
            description: 'A quantitative environment type definition, with possible min/max constraint.',
            type: 'object',
            additionalProperties: false,
            required: ['environment_quantitative_id', 'name', 'description', 'min', 'max', 'unit'],
            properties: {
              environment_quantitative_id: {
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
              }
            }
          }
        }
      }
    },
    pagination: { ...paginationResponseSchema }
  }
};
