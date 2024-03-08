import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';
import { ensureCompletePaginationOptions, makePaginationResponse } from '../../../../../../utils/pagination';
import { ApiPaginationOptions } from '../../../../../../zod-schema/pagination';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyObservations()
];

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  insertUpdateSurveyObservationsWithMeasurements()
];

GET.apiDoc = {
  description: 'Get all observations for the survey.',
  tags: ['observation'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: {
            description: 'Survey get response object, for view purposes',
            type: 'object',
            required: ['surveyObservations', 'supplementaryObservationData', 'pagination'],
            properties: {
              surveyObservations: {
                type: 'array',
                items: {
                  type: 'object',
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
                    'observation_time',
                    'observation_date',
                    'create_date',
                    'create_user',
                    'update_date',
                    'update_user',
                    'revision_count',
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
                    observation_time: {
                      type: 'string'
                    },
                    observation_date: {
                      type: 'string'
                    },
                    create_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the project start date'
                    },
                    create_user: {
                      type: 'integer',
                      minimum: 1
                    },
                    update_date: {
                      oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                      description: 'ISO 8601 date string for the project start date',
                      nullable: true
                    },
                    update_user: {
                      type: 'integer',
                      minimum: 1,
                      nullable: true
                    },
                    revision_count: {
                      type: 'integer',
                      minimum: 0
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
                        required: [
                          'observation_subcount_id',
                          'subcount',
                          'qualitative_measurements',
                          'quantitative_measurements'
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
                              },
                              additionalProperties: false
                            }
                          },
                          quantitative_measurements: {
                            type: 'array',
                            items: {
                              type: 'object',
                              required: ['critterbase_taxon_measurement_id', 'value'],
                              properties: {
                                critterbase_taxon_measurement_id: {
                                  type: 'string',
                                  format: 'uuid'
                                },
                                value: {
                                  type: 'number'
                                }
                              },
                              additionalProperties: false
                            }
                          }
                        },
                        additionalProperties: false
                      }
                    }
                  },
                  additionalProperties: false
                }
              },
              supplementaryObservationData: {
                type: 'object',
                required: ['observationCount', 'qualitative_measurements', 'quantitative_measurements'],
                properties: {
                  observationCount: {
                    type: 'integer',
                    minimum: 0
                  },
                  qualitative_measurements: {
                    description: 'All qualitative measurement type definitions for the survey.',
                    type: 'array',
                    items: {
                      description: 'A qualitative measurement type definition, with array of valid/accepted options',
                      type: 'object',
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
                            required: [
                              'taxon_measurement_id',
                              'qualitative_option_id',
                              'option_label',
                              'option_value',
                              'option_desc'
                            ],
                            properties: {
                              taxon_measurement_id: {
                                type: 'string'
                              },
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
                            },
                            additionalProperties: false
                          }
                        }
                      },
                      additionalProperties: false
                    }
                  },
                  quantitative_measurements: {
                    description: 'All quantitative measurement type definitions for the survey.',
                    type: 'array',
                    items: {
                      description: 'A quantitative measurement type definition, with possible min/max constraint.',
                      type: 'object',
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
                      },
                      additionalProperties: false
                    }
                  }
                },
                additionalProperties: false
              },
              pagination: { ...paginationResponseSchema }
            },
            additionalProperties: false
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

PUT.apiDoc = {
  description: 'Insert/update/delete observations for the survey.',
  tags: ['observation'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey observation record data',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            surveyObservations: {
              description: 'Survey observation records.',
              type: 'array',
              items: {
                description: 'A single survey observation record.',
                type: 'object',
                required: ['standardColumns', 'subcounts'],
                properties: {
                  standardColumns: {
                    description: 'Standard column data for an observation record.',
                    type: 'object',
                    required: [
                      'itis_tsn',
                      'survey_sample_site_id',
                      'survey_sample_method_id',
                      'survey_sample_period_id',
                      'count',
                      'latitude',
                      'longitude',
                      'observation_date',
                      'observation_time'
                    ],
                    properties: {
                      survey_observation_id: {
                        type: 'integer',
                        nullable: true
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
                        type: 'integer'
                      },
                      survey_sample_method_id: {
                        type: 'integer'
                      },
                      survey_sample_period_id: {
                        type: 'integer'
                      },
                      count: {
                        type: 'integer'
                      },
                      subcount: {
                        type: 'integer'
                      },
                      latitude: {
                        type: 'number'
                      },
                      longitude: {
                        type: 'number'
                      },
                      observation_date: {
                        type: 'string'
                      },
                      observation_time: {
                        type: 'string'
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
                      }
                    },
                    additionalProperties: true
                  },
                  subcounts: {
                    description: 'An array of observation subcount and measurement data',
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        observation_subcount_id: {
                          type: 'number',
                          nullable: true
                        },
                        subcount: {
                          type: 'number'
                        },
                        qualitative: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              measurement_id: {
                                type: 'string'
                              },
                              measurement_option_id: {
                                type: 'string'
                              }
                            }
                          }
                        },
                        quantitative: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              measurement_id: {
                                type: 'string'
                              },
                              measurement_value: {
                                type: 'number'
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                additionalProperties: false
              }
            }
          },
          additionalProperties: false
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Update OK'
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
 * This record maps observation table sampling site site ID columns to sampling data
 * columns that can be sorted on.
 *
 * TODO We should probably modify frontend functionality to make requests to sort on these
 * columns.
 */
const samplingSiteSortingColumnName: Record<string, string> = {
  survey_sample_site_id: 'survey_sample_site_name',
  survey_sample_method_id: 'survey_sample_method_name',
  survey_sample_period_id: 'survey_sample_period_start_datetime'
};

/**
 * Fetch all observations for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    defaultLog.debug({ label: 'getSurveyObservations', surveyId });

    const page: number | undefined = req.query.page ? Number(req.query.page) : undefined;
    const limit: number | undefined = req.query.limit ? Number(req.query.limit) : undefined;
    const order: 'asc' | 'desc' | undefined = req.query.order ? (String(req.query.order) as 'asc' | 'desc') : undefined;

    const sortQuery: string | undefined = req.query.sort ? String(req.query.sort) : undefined;
    let sort = sortQuery;

    if (sortQuery && samplingSiteSortingColumnName[sortQuery]) {
      sort = samplingSiteSortingColumnName[sortQuery];
    }

    const paginationOptions: Partial<ApiPaginationOptions> = { page, limit, order, sort };

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData = await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
        surveyId,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const observationCount = observationData.supplementaryObservationData.observationCount;

      return res.status(200).json({
        surveyObservations: observationData.surveyObservations,
        supplementaryObservationData: observationData.supplementaryObservationData,
        pagination: makePaginationResponse(observationCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts new observation records.
 * Updates existing observation records.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function insertUpdateSurveyObservationsWithMeasurements(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'insertUpdateSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationRows = req.body.surveyObservations;

      await observationService.insertUpdateSurveyObservationsWithMeasurements(surveyId, observationRows);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'insertUpdateSurveyObservationsWithMeasurements', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
