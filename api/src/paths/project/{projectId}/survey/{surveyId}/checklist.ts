import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { getSurveyChecklistResponse } from '../../../../../openapi/schemas/survey';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/checklist');

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
  getSurveyChecklist()
];

GET.apiDoc = {
  description: 'Get the checklist for a survey',
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
      description: 'Survey checklist response',
      content: {
        'application/json': {
          schema: {
            title: 'Survey checklist get response object',
            type: 'object',
            additionalProperties: false,
            required: ['checklist'],
            properties: {
              checklist: getSurveyChecklistResponse
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

export function getSurveyChecklist(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const checklist = await surveyService.getSurveyChecklist(surveyId);

      await connection.commit();

      return res.status(200).json(checklist);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyChecklist', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
