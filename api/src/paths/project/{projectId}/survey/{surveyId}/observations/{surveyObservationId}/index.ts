import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import {
  findObservationsSchema,
  observationsSupplementaryDataSchema
} from '../../../../../../../openapi/schemas/observation';
import { UpdateSurveyObservation } from '../../../../../../../repositories/observation-repository/observation-repository.interface';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../../services/observation-services/observation-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/{surveyObservationId}');

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
  getSurveyObservation()
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
  putSurveyObservation()
];

GET.apiDoc = {
  description: 'Get single observation for the survey.',
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
    {
      in: 'path',
      name: 'surveyObservationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,

            required: ['surveyObservation', 'supplementaryObservationData'],
            properties: {
              surveyObservation: findObservationsSchema,
              supplementaryObservationData: observationsSupplementaryDataSchema
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
  description: 'Update an observation record for the survey.',
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
    {
      in: 'path',
      name: 'surveyObservationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
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
            surveyObservation: {
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
 * Get a survey observation record, which includes additional data.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservation(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyObservationId = Number(req.params.surveyObservationId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData = await observationService.getSurveyObservation(surveyId, surveyObservationId);

      await connection.commit();

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update an existing survey observation record.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function putSurveyObservation(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const updateSurveyObservationObject: UpdateSurveyObservation = req.body.surveyObservation;

      await connection.open();

      const observationService = new ObservationService(connection);

      await observationService.updateObservation(surveyId, updateSurveyObservationObject);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'putSurveyObservation', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
