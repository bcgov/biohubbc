import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/delete');

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
  deleteSurveyObservations()
];

POST.apiDoc = {
  description: 'Delete survey observations.',
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
            surveyObservationIds: {
              type: 'array',
              minItems: 1,
              items: {
                anyOf: [
                  {
                    type: 'integer'
                  },
                  {
                    type: 'string'
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Delete OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['supplementaryObservationData'],
            properties: {
              supplementaryObservationData: {
                type: 'object',
                required: ['observationCount'],
                properties: {
                  observationCount: {
                    type: 'integer',
                    minimum: 0
                  },
                  measurementColumns: {
                    type: 'array',
                    items: {
                      anyOf: [
                        {
                          description: 'A quantitative (number) measurement, with possible min/max constraint.',
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
                              type: 'number',
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
                        },
                        {
                          description: 'A qualitative (string) measurement, with array of valid/accepted options',
                          type: 'object',
                          required: [
                            'itis_tsn',
                            'taxon_measurement_id',
                            'measurement_name',
                            'measurement_desc',
                            'options'
                          ],
                          properties: {
                            itis_tsn: {
                              type: 'number',
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
                              description: 'Valid otions for the measurement.',
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
                      ]
                    }
                  }
                },
                additionalProperties: false
              }
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

/**
 * Fetch all observations for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'deleteSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const deleteObservationIds =
        req.body?.surveyObservationIds?.map((observationId: string | number) => Number(observationId)) ?? [];

      await observationService.deleteObservationsByIds(deleteObservationIds);
      const supplementaryObservationData = await observationService.getSurveyObservationsSupplementaryData(surveyId);

      await connection.commit();

      return res.status(200).json({ supplementaryObservationData });
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
