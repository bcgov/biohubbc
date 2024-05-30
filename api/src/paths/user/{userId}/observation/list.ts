import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { IObservationAdvancedFilters } from '../../../../models/observation-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../services/observation-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('paths/user');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getObservationsForUserId()
];

GET.apiDoc = {
  description: 'Gets a list of observations based on search parameters if passed in.',
  tags: ['observations'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [...paginationRequestQueryParamSchema],
  requestBody: {
    description: 'Observation list search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
              nullable: true
            },
            project_programs: {
              type: 'array',
              items: {
                type: 'integer'
              },
              nullable: true
            },
            keyword: {
              type: 'string',
              nullable: true
            },
            project_name: {
              type: 'string',
              nullable: true
            },
            itis_tsns: {
              type: 'array',
              items: {
                type: 'integer'
              }
            },
            system_user_id: {
              type: 'integer'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Observation response object.',
      content: {
        'application/json': {
          schema: {
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
                      type: 'number'
                    },
                    longitude: {
                      type: 'number'
                    },
                    count: {
                      type: 'integer'
                    },
                    observation_date: {
                      type: 'string'
                    },
                    observation_time: {
                      type: 'string'
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
                          'qualitative_measurements',
                          'quantitative_measurements',
                          'qualitative_environments',
                          'quantitative_environments'
                        ],
                        properties: {
                          observation_subcount_id: {
                            type: 'integer'
                          },
                          subcount: {
                            type: 'number'
                          },
                          qualitative_measurements: {
                            type: 'array',
                            items: {
                              type: 'object',
                              additionalProperties: false,
                              required: [
                                'critterbase_taxon_measurement_id',
                                'critterbase_measurement_qualitative_option_id'
                              ],
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
                              required: ['environment_qualitative_id', 'environment_qualitative_option_id'],
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
                              required: ['environment_quantitative_id', 'value'],
                              properties: {
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
                            required: [
                              'environment_qualitative_option_id',
                              'environment_qualitative_id',
                              'name',
                              'description'
                            ],
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
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all observations (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getObservationsForUserId(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getObservationsForUserId' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      const filterFields: IObservationAdvancedFilters = {
        keyword: req.query.keyword && String(req.query.keyword),
        minimum_count: req.query.minimum_count ? Number(req.query.minimum_count) : undefined,
        itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined,
        minimum_date: req.query.minimum_date && String(req.query.minimum_date),
        maximum_date: req.query.maximum_date && String(req.query.maximum_date),
        minimum_time: req.query.minimum_time && String(req.query.minimum_time),
        maximum_time: req.query.maximum_time && String(req.query.maximum_time),
        system_user_id: req.query.system_user_id && String(req.query.system_user_id)
      };

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const observationService = new ObservationService(connection);
      const observations = await observationService.getObservationsForUserId(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const observationsTotalCount = await observationService.getSurveyObservationCountByUserId(
        isUserAdmin,
        systemUserId,
        filterFields
      );

      const response = {
        ...observations,
        pagination: makePaginationResponse(observationsTotalCount, paginationOptions)
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getObservationsForUserId', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
