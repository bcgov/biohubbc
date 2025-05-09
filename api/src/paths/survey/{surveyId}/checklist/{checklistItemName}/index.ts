import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyChecklistService } from '../../../../../services/survey-checklist-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/checklist/{checkistItemName');

export const DELETE: Operation = [
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
  deletSurveyChecklistItemIgnore()
];

DELETE.apiDoc = {
  description: 'Delete a survey checklist item ignore record, implying that the item applies to the survey',
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
    },
    {
      in: 'path',
      name: 'checklistItemName',
      schema: {
        type: 'string'
      },
      required: true
    }
  ],
  responses: {
    201: {
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

export function deletSurveyChecklistItemIgnore(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyChecklistService = new SurveyChecklistService(connection);

      const checklistItemName = req.params.checklistItemName as string;

      await surveyChecklistService.deleteSurveyChecklistItemIgnore(surveyId, checklistItemName);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'deletSurveyChecklistItemIgnore', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
