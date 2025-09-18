import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { IPostSurveyMember } from '../../../models/survey-create';
import { paginationRequestQueryParamSchema } from '../../../openapi/schemas/pagination';
import { CreateSurveyMemberSchema } from '../../../openapi/schemas/survey';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { SurveyMemberService } from '../../../services/survey-member-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/survey/members/index');

export const POST: Operation = [
  authorizeRequestHandler((_req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  addMembersToSurveys()
];

POST.apiDoc = {
  description: 'Adds multiple members to a survey',
  tags: ['surveys'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [...paginationRequestQueryParamSchema],
  requestBody: {
    description: 'Survey member create request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['selectedMembers', 'selectedSurveys'],
          properties: {
            selectedMembers: {
              type: 'array',
              minItems: 1,
              items: CreateSurveyMemberSchema,
              description: 'Users invited to each of the surveys in this object'
            },
            selectedSurveys: {
              type: 'array',
              minItems: 1,
              items: { type: 'integer', minimum: 1 },
              description: 'Surveys to which the members will be added'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey response object.'
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
 * Add members to any number of surveys.
 *
 * @returns {RequestHandler}
 */
export function addMembersToSurveys(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'addMembersToSurveys' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyIds = req.body.selectedSurveys as number[];

      const surveyMemberService = new SurveyMemberService(connection);

      const data = req.body.selectedMembers as IPostSurveyMember[];

      await surveyMemberService.insertMembersToSurveys(surveyIds, data);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'addMembersToSurveys', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
