import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  findObservationsSchema,
  observationsSupplementaryDataSchema
} from '../../../../../../openapi/schemas/observation';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import {
  InsertUpdateObservations,
  ObservationService
} from '../../../../../../services/observation-services/observation-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

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
  putObservations()
];

export const POST: Operation = [
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
  postObservations()
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
            type: 'object',
            additionalProperties: false,
            required: ['surveyObservations', 'supplementaryObservationData', 'pagination'],
            properties: {
              surveyObservations: findObservationsSchema,
              supplementaryObservationData: observationsSupplementaryDataSchema,
              pagination: paginationResponseSchema
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
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            surveyObservations: {
              description: 'Survey observation records.',
              type: 'array',
              items: {
                description: 'A single survey observation record.',
                type: 'object',
                additionalProperties: false,
                required: ['standardColumns', 'subcounts'],
                properties: {
                  standardColumns: {
                    description: 'Standard column data for an observation record.',
                    type: 'object',
                    additionalProperties: false,
                    required: [
                      'itis_tsn',
                      'itis_scientific_name',
                      'survey_sample_period_id',
                      'count',
                      'latitude',
                      'longitude',
                      'observation_date',
                      'observation_time',
                      'observation_sign_id',
                      'qualitative_environments',
                      'quantitative_environments'
                    ],
                    properties: {
                      survey_observation_id: {
                        type: 'integer',
                        minimum: 1,
                        nullable: true,
                        description:
                          'The survey observation ID. If provided, the matching existing observation record will be updated. If not provided, a new observation record will be inserted.'
                      },
                      itis_tsn: {
                        type: 'integer'
                      },
                      itis_scientific_name: {
                        type: 'string',
                        nullable: true
                      },
                      survey_sample_period_id: {
                        type: 'integer',
                        minimum: 1,
                        nullable: true
                      },
                      count: {
                        type: 'integer',
                        description: "The observation record's count."
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
                      observation_sign_id: {
                        type: 'integer',
                        minimum: 1,
                        description:
                          'The observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.'
                      },
                      qualitative_environments: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          required: ['environment_qualitative_id', 'environment_qualitative_option_id'],
                          properties: {
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
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
                      }
                    }
                  },
                  subcounts: {
                    description: 'An array of observation subcount records.',
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['subcount', 'comment', 'qualitative_measurements', 'quantitative_measurements'],
                      properties: {
                        observation_subcount_id: {
                          type: 'integer',
                          minimum: 1,
                          nullable: true,
                          description:
                            'The observation subcount ID. If provided, the mataching existing subcount record will be updated. If not provided, a new subcount record will be inserted.'
                        },
                        comment: {
                          type: 'string',
                          nullable: true,
                          description: 'A comment or note about the subcount'
                        },
                        subcount: {
                          type: 'number',
                          description: "The subcount record's count."
                        },
                        qualitative_measurements: {
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['measurement_id', 'measurement_option_id'],
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
                        quantitative_measurements: {
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['measurement_id', 'measurement_value'],
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
                }
              }
            }
          }
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

POST.apiDoc = {
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
    required: true,
    content: {
      'application/json': {
        schema: {
          description: 'A single survey observation record.',
          type: 'object',
          additionalProperties: false,
          required: ['standardColumns', 'subcounts'],
          properties: {
            standardColumns: {
              description: 'Standard column data for an observation record.',
              type: 'object',
              additionalProperties: false,
              required: [
                'itis_tsn',
                'itis_scientific_name',
                'survey_sample_period_id',
                'count',
                'latitude',
                'longitude',
                'observation_date',
                'observation_time',
                'observation_sign_id',
                'qualitative_environments',
                'quantitative_environments'
              ],
              properties: {
                itis_tsn: {
                  type: 'integer'
                },
                itis_scientific_name: {
                  type: 'string',
                  nullable: true
                },
                survey_sample_period_id: {
                  type: 'integer',
                  minimum: 1,
                  nullable: true
                },
                count: {
                  type: 'integer',
                  description: "The observation record's count.",
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
                observation_date: {
                  type: 'string',
                  nullable: true
                },
                observation_time: {
                  type: 'string',
                  nullable: true
                },
                observation_sign_id: {
                  type: 'integer',
                  minimum: 1,
                  description:
                    'The observation observation sign ID, indicating whether the observation was a direct sighting, footprints, scat, etc.',
                  nullable: true
                },
                qualitative_environments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['environment_qualitative_id', 'environment_qualitative_option_id'],
                    properties: {
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
            },
            subcounts: {
              description: 'An array of observation subcount records.',
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['subcount', 'comment', 'qualitative_measurements', 'quantitative_measurements'],
                properties: {
                  subcount: {
                    type: 'number',
                    description: "The subcount record's count."
                  },
                  comment: {
                    type: 'string',
                    nullable: true,
                    description: 'A comment or note about the subcount'
                  },
                  qualitative_measurements: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
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
                  quantitative_measurements: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
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
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Create observations OK'
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
  method_technique_id: 'method_technique_name',
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

    const paginationOptions = makePaginationOptionsFromRequest(req);
    if (paginationOptions.sort && samplingSiteSortingColumnName[paginationOptions.sort]) {
      paginationOptions.sort = samplingSiteSortingColumnName[paginationOptions.sort];
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData =
        await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
          surveyId,
          ensureCompletePaginationOptions(paginationOptions)
        );

      await connection.commit();

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
export function putObservations(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const observationRows: InsertUpdateObservations[] = req.body.surveyObservations;

      defaultLog.debug({ label: 'putObservations', surveyId });

      await connection.open();

      const observationService = new ObservationService(connection);

      // Insert/update observation records
      await observationService.insertUpdateManualSurveyObservations(surveyId, observationRows);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'putObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts new observation records.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function postObservations(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const observationRow: InsertUpdateObservations = req.body;

      defaultLog.debug({ label: 'postObservations', surveyId });

      await connection.open();

      const observationService = new ObservationService(connection);

      // Insert/update observation records
      await observationService.insertUpdateManualSurveyObservations(surveyId, [observationRow]);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'postObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
