import { SchemaObject } from 'ajv';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { getLogger } from '../../../../../../utils/logger';

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
  getSurveyObservationsGeometry()
];

export const surveyObservationsSupplementaryData: SchemaObject = {
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
            required: ['itis_tsn', 'taxon_measurement_id', 'measurement_name', 'measurement_desc', 'options'],
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
        ]
      }
    }
  },
  additionalProperties: false
};

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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey Observations spatial get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            nullable: true,
            required: ['supplementaryObservationData', 'surveyObservationsGeometry'],
            properties: {
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
              surveyObservationsGeometry: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['survey_observation_id', 'geometry'],
                  properties: {
                    survey_observation_id: {
                      type: 'integer'
                    },
                    geometry: {
                      type: 'object'
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
export function getSurveyObservationsGeometry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyObservationsGeometry', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationData = await observationService.getSurveyObservationsGeometryWithSupplementaryData(surveyId);

      return res.status(200).json(observationData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservationsGeometry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
