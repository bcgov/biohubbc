import { SchemaObject } from 'ajv';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { InsertObservation, UpdateObservation } from '../../../../../../repositories/observation-repository';
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
          projectId: Number(req.params.projectId),
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
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  insertUpdateDeleteSurveyObservations()
];

const surveyObservationsResponseSchema: SchemaObject = {
  title: 'Survey get response object, for view purposes',
  type: 'object',
  nullable: true,
  required: ['surveyObservations'],
  properties: {
    surveyObservations: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'survey_observation_id',
          'wldtaxonomic_units_id',
          'latitude',
          'longitude',
          'count',
          'observation_date',
          'observation_time',
          'create_user',
          'create_date',
          'update_user',
          'update_date',
          'revision_count'
        ],
        properties: {
          survey_observation_id: {
            type: 'integer'
          },
          wldtaxonomic_units_id: {
            type: 'integer'
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
          }
        }
      }
    }
  }
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
      description: 'Survey Observations get response.',
      content: {
        'application/json': {
          schema: { ...surveyObservationsResponseSchema }
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
              description: 'Survey observation reords.',
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'wldtaxonomic_units_id',
                  'count',
                  'latitude',
                  'longitude',
                  'observation_date',
                  'observation_time'
                ],
                properties: {
                  wldtaxonomic_units_id: {
                    oneOf: [{ type: 'integer' }, { type: 'string' }]
                  },
                  count: {
                    type: 'number'
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
    200: {
      description: 'Update OK',
      content: {
        'application/json': {
          schema: { ...surveyObservationsResponseSchema }
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
export function getSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const surveyObservations = await observationService.getSurveyObservations(surveyId);
      return res.status(200).json({ surveyObservations });
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
 * Deletes missing observation records.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function insertUpdateDeleteSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'insertUpdateDeleteSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      // Sanitize all incoming records
      const records: (InsertObservation | UpdateObservation)[] = req.body.surveyObservations.map((record: any) => {
        return {
          survey_observation_id: record.survey_observation_id,
          wldtaxonomic_units_id: Number(record.wldtaxonomic_units_id),
          survey_sample_site_id: record.survey_sample_site_id,
          survey_sample_method_id: record.survey_sample_method_id,
          survey_sample_period_id: record.survey_sample_period_id,
          latitude: record.latitude,
          longitude: record.longitude,
          count: record.count,
          observation_date: record.observation_date,
          observation_time: record.observation_time
        } as InsertObservation | UpdateObservation;
      });

      const surveyObservations = await observationService.insertUpdateDeleteSurveyObservations(surveyId, records);

      await connection.commit();

      return res.status(200).json({ surveyObservations });
    } catch (error) {
      defaultLog.error({ label: 'insertUpdateDeleteSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
