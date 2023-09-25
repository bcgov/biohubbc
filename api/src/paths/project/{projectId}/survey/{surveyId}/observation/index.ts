import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../utils/logger';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { ObservationService } from '../../../../../../services/observation-service';

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

// TODO add PUT method here

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
