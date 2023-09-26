import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../utils/logger';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { ObservationService } from '../../../../../../services/observation-service';
import { InsertObservation, UpdateObservation } from '../../../../../../repositories/observation-repository';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/get');

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
          schema: {
            title: 'Survey get response object, for view purposes',
            type: 'object',
            nullable: true,
            required: ['surveyObservationData', 'surveyObservationSupplementaryData'],
            properties: {
              surveyObservations: {
                type: 'object',
                properties: {
                  survey_observation_id: {
                    type: 'integer'
                  },
                  wldtaxonomic_units_id: {
                    type: 'integer'
                  },
                  latlong: {
                    type: 'integer'
                  },
                  count: {
                    type: 'integer'
                  },
                  observation_datetime: {
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
                required: ['speciesName', 'count', 'latitude', 'longitude', 'date', 'time'],
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
                  date: {
                    type: 'string'
                  },
                  time: {
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
          schema: {
            type: 'object',
            properties: {
              // TODO do we need to include anything in this response?
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
          observation_datetime: new Date(`${record.date} ${record.time}`)
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
          observation_datetime: new Date(`${record.date} ${record.time}`)
        }
      });

      await observationService.insertUpdateSurveyObservations(records);

      return res.status(200).json({});
    } catch (error) {
      defaultLog.error({ label: 'insertUpdateSurveyObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
