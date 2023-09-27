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
  insertUpdateSurveyObservations()
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
          // 'update_user',
          // 'update_date',
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
  description: 'Fetches observation records for the given survey.',
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
      $ref: '#/components/responses/401'
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
  description: 'Fetches observation records for the given survey.',
  tags: ['attachments'],
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
                required: ['speciesName', 'count', 'latitude', 'longitude', 'observation_date', 'observation_time'],
                properties: {
                  speciesName: {
                    type: 'string'
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
      description: 'Upload OK',
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const surveyObservations = observationService.getSurveyObservations(surveyId);
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

export function insertUpdateSurveyObservations(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'insertUpdateSurveyObservations', surveyId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      /*
      const taxonomyService = new TaxonomyService();
      const promises: Promise<(InsertObservation | UpdateObservation)>[] = req.body.map((record: any) => {
        return taxonomyService.searchSpecies(record.speciesName.toLowerCase()).then((taxonCodes) => ({        
          survey_id: surveyId,
          survey_observation_id: record.survey_observation_id,
          wldtaxonomic_units_id: taxonCodes[0].id,
          latitude: record.latitude,
          longitude: record.longitude,
          count: record.count,
          observation_date: record.observation_date,
          observation_time: record.observation_time
        }))
      });
      const records = await Promise.all(promises);
      */

      const records: (InsertObservation | UpdateObservation)[] = req.body.surveyObservations.map((record: any) => {
        return {
          survey_id: surveyId,
          survey_observation_id: record.survey_observation_id,
          wldtaxonomic_units_id: 1234,
          latitude: record.latitude,
          longitude: record.longitude,
          count: record.count,
          observation_date: record.observation_date,
          observation_time: record.observation_time
        };
      });

      const surveyObservations = await observationService.insertUpdateSurveyObservations(surveyId, records);

      return res.status(200).json({ surveyObservations });
    } catch (error) {
      defaultLog.error({ label: 'insertUpdateSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
