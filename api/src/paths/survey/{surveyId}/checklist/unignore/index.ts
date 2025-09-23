import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyChecklistService } from '../../../../../services/survey-checklist-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/checklist/unignore');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        }
      ]
    };
  }),
  deleteSurveyChecklistItemIgnore()
];

POST.apiDoc = {
  description: 'Deletes survey checklist item ignore records, implying that the item does apply to the survey',
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
  requestBody: {
    description: 'Checklist item unignore post request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Checklist item unignore post request object.',
          type: 'object',
          additionalProperties: false,
          required: ['checklistItemNames'],
          properties: {
            checklistItemNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'An array of checklist item names to unignore'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey checklist response'
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

export function deleteSurveyChecklistItemIgnore(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyChecklistService = new SurveyChecklistService(connection);

      const checklistItemNames = req.body.checklistItemNames as string[];

      await surveyChecklistService.deleteSurveyChecklistItemIgnore(surveyId, checklistItemNames);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyChecklistItemIgnore', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
