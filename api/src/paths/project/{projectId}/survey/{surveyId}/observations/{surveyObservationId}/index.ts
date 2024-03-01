import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../../services/observation-service';
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
            required: [
              'survey_observation_id',
              'latitude',
              'longitude',
              'count',
              'itis_tsn',
              'itis_scientific_name',
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
              latitude: {
                type: 'number'
              },
              longitude: {
                type: 'number'
              },
              count: {
                type: 'integer'
              },
              itis_tsn: {
                type: 'integer'
              },
              itis_scientific_name: {
                type: 'string'
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
export function getSurveyObservation(): RequestHandler {
  return async (req, res) => {
    const surveyObservationId = Number(req.params.surveyObservationId);

    defaultLog.debug({ label: 'getSurveyObservation', surveyObservationId });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      // @TODO SIMSBIOHUB-494 audit
      const observationData = await observationService.getSurveyObservationById(surveyObservationId);

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
