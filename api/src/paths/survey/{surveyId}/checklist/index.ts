import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { COLLECTION_ROLE, SURVEY_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { getSurveyChecklistResponse } from '../../../../openapi/schemas/survey';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyChecklistService } from '../../../../services/survey-checklist-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/checklist');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validCollectionRoles: [COLLECTION_ROLE.ADMIN, COLLECTION_ROLE.MEMBER],
          collectionId: Number(req.params.surveyId),
          discriminator: 'CollectionRole'
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

      const surveyChecklistService = new SurveyChecklistService(connection);

      const checklist = await surveyChecklistService.getSurveyChecklist(surveyId);

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
  insertSurveyChecklistItemIgnore()
];

POST.apiDoc = {
  description: 'Add a survey checklist item to the ignore list',
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
    description: 'Checklist item ignore post request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Checklist item ignore post request object.',
          type: 'object',
          additionalProperties: false,
          required: ['checklistItemNames'],
          properties: {
            checklistItemNames: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'An array of checklist item names to ignore'
            }
          }
        }
      }
    }
  },
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

export function insertSurveyChecklistItemIgnore(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyChecklistService = new SurveyChecklistService(connection);

      const checklistItemNames = req.body.checklistItemNames as string[];

      await surveyChecklistService.insertSurveyChecklistItemIgnore(surveyId, checklistItemNames);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'insertSurveyChecklistItemIgnore', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
