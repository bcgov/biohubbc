import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { IPostSurveyMember } from '../../../../models/survey-create';
import { paginationRequestQueryParamSchema } from '../../../../openapi/schemas/pagination';
import { CreateSurveyMemberSchema } from '../../../../openapi/schemas/survey';
import { surveyAndSystemUserSchema } from '../../../../openapi/schemas/user';
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
            required: ['members'],
            properties: {
              members: {
                type: 'array',
                items: surveyAndSystemUserSchema
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

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  addMembersToSurvey()
];

POST.apiDoc = {
  description: 'Adds multiple members to a survey',
  tags: ['surveys'],
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
    },
    ...paginationRequestQueryParamSchema
  ],
  requestBody: {
    description: 'Survey member create request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['members'],
          properties: { members: { type: 'array', minItems: 1, items: CreateSurveyMemberSchema } }
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
 * Adds members to a survey
 *
 * @returns {RequestHandler}
 */
export function addMembersToSurvey(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'addMembersToSurvey' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);

      const surveyMemberService = new SurveyMemberService(connection);

      const data = req.body.members as IPostSurveyMember[];

      await surveyMemberService.insertSurveyMembers(surveyId, data);

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'addMembersToSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
