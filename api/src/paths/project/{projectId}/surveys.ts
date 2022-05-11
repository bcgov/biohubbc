import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { survey200GetResponseObject } from '../../../openapi/schemas/survey';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { SurveyService } from '../../../services/survey-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/surveys');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Get all Surveys.',
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
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(survey200GetResponseObject as object)
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
 * Get all surveys.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyIdsResponse = await surveyService.getSurveyIdsByProjectId(Number(req.params.projectId));

      const surveyIds = surveyIdsResponse.map((item: { id: any }) => item.id);

      const surveys = await surveyService.getSurveysByIds(surveyIds);

      await connection.commit();

      return res.status(200).json(surveys);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
