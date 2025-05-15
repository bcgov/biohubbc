import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyMemberService } from '../../../../services/survey-member-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/survey/{surveyId}/members');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyMembers()
];

GET.apiDoc = {
  description: 'Get all survey members.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
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
      description: 'List of survey members.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              members: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    survey_member_id: {
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
 * Get all survey members.
 *
 * @returns {RequestHandler}
 */
export function getSurveyMembers(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      await connection.open();

      const surveyMemberService = new SurveyMemberService(connection);

      const result = await surveyMemberService.getSurveyMembers(surveyId);

      await connection.commit();

      return res.status(200).json({ members: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyMembers', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
