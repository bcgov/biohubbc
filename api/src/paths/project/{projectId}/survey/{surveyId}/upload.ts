import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../services/platform-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  uploadSurveyToBackbone()
];

POST.apiDoc = {
  description: 'upload a survey to backbone.',
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
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey delete response',
            type: 'boolean'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function uploadSurveyToBackbone(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const surveyId = Number(req.params.surveyId);

    if (!surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      try {
        const platformService = new PlatformService(connection);
        await platformService.submitSurvey(projectId, surveyId);
      } catch (error) {
        // Don't fail the rest of the endpoint if submitting data fails
        defaultLog.error({ label: 'uploadSurveyToBackbone->submitSurvey', message: 'error', error });
      }

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'uploadSurveyToBackbone', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
