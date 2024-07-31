import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import {
    paginationRequestQueryParamSchema,
    paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { techniqueCreateSchema, techniqueViewSchema } from '../../../../../../openapi/schemas/technique';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TechniqueService } from '../../../../../../services/technique-service';
import { getLogger } from '../../../../../../utils/logger';
import {
    ensureCompletePaginationOptions,
    makePaginationOptionsFromRequest,
    makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/index');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  createTechniques()
];

POST.apiDoc = {
  description: 'Insert a new technique for a survey.',
  tags: ['technique'],
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
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['techniques'],
          additionalProperties: false,
          properties: {
            techniques: {
              type: 'array',
              items: techniqueCreateSchema
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Technique created OK.'
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
 * Create new techniques for a survey.
 *
 * @returns
 */
export function createTechniques(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);

      const techniqueService = new TechniqueService(connection);
      await techniqueService.insertTechniquesForSurvey(surveyId, req.body.techniques);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'createTechniques', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
  getTechniques()
];

GET.apiDoc = {
  description: 'Get all techniques for a survey.',
  tags: ['technique'],
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
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of survey techniques.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['techniques', 'count'],
            additionalProperties: false,
            properties: {
              techniques: {
                type: 'array',
                items: techniqueViewSchema
              },
              count: {
                type: 'number',
                description: 'Count of method techniques in the respective survey.'
              },
              pagination: { ...paginationResponseSchema }
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
 * Get all techniques for a survey.
 *
 * @returns {RequestHandler}
 */
export function getTechniques(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const paginationOptions = makePaginationOptionsFromRequest(req);

      const techniqueService = new TechniqueService(connection);

      const [techniques, techniquesCount] = await Promise.all([
        techniqueService.getTechniquesForSurveyId(surveyId, ensureCompletePaginationOptions(paginationOptions)),
        techniqueService.getTechniquesCountForSurveyId(surveyId)
      ]);

      await connection.commit();

      return res.status(200).json({
        techniques,
        count: techniquesCount,
        pagination: makePaginationResponse(techniquesCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTechniques', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
