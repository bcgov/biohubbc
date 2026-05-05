import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../../services/platform-service';
import { SurveyService } from '../../../../../../services/survey-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/publish/features');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyPublishableFeatures()
];

GET.apiDoc = {
  description: 'Get survey publishable feature types.',
  tags: ['survey', 'biohub'],
  security: [{ Bearer: [] }],
  parameters: [
    { in: 'path', name: 'projectId', required: true, schema: { type: 'integer', minimum: 1 } },
    { in: 'path', name: 'surveyId', required: true, schema: { type: 'integer', minimum: 1 } }
  ],
  responses: {
    200: {
      description: 'Publishable feature types for the survey.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['featureTypes'],
            properties: {
              featureTypes: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    401: { $ref: '#/components/responses/401' },
    403: { $ref: '#/components/responses/403' },
    500: { $ref: '#/components/responses/500' }
  }
};

export function getSurveyPublishableFeatures(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    const projectId = Number(req.params.projectId);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const surveyData = await surveyService.getSurveyData(surveyId);

      if (surveyData.project_id !== projectId) {
        throw new HTTP400('Invalid project or survey identifier.');
      }

      const platformService = new PlatformService(connection);
      const response = await platformService.getSurveyPublishableFeatures(surveyId);

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyPublishableFeatures', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
