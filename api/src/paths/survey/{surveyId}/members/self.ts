import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { surveyAndSystemUserSchema } from '../../../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyMemberService } from '../../../../services/survey-member-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/survey/{surveyId}/members/self');

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
  getUserSurveyMember()
];

GET.apiDoc = {
  description: 'Get the survey member record for the authenticated user.',
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
          schema: { ...surveyAndSystemUserSchema, nullable: true }
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
 * Get the survey member record of the currently authenticated user
 *
 * @returns {RequestHandler}
 */
export function getUserSurveyMember(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const systemUserId = connection.systemUserId();

      const surveyMemberService = new SurveyMemberService(connection);

      const result = await surveyMemberService.getSurveyMember(surveyId, systemUserId);

      console.log('RESULT', result);

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getUserSurveyMember', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
