import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyParticipationService } from '../../../../../../services/survey-participation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/participants/get');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
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
  getSurveyParticipants()
];

GET.apiDoc = {
  description: 'Get all survey participants.',
  tags: ['survey'],
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
    }
  ],
  responses: {
    200: {
      description: 'List of survey participants.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    survey_participation_id: {
                      type: 'number'
                    },
                    survey_id: {
                      type: 'number'
                    },
                    system_user_id: {
                      type: 'number'
                    },
                    survey_job_id: {
                      type: 'number'
                    },
                    survey_job_name: {
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

/**
 * Get all survey participants.
 *
 * @returns {RequestHandler}
 */
export function getSurveyParticipants(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);

      await connection.open();

      const surveyParticipationService = new SurveyParticipationService(connection);

      const result = await surveyParticipationService.getSurveyParticipants(surveyId);

      await connection.commit();

      return res.status(200).json({ participants: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyParticipants', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
