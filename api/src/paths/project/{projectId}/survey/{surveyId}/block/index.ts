import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { surveyBlockSchema } from '../../../../../../openapi/schemas/survey';
import { PostSurveyBlocksRequest } from '../../../../../../repositories/survey-block-repository';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyBlockService } from '../../../../../../services/survey-block-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/block');

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
  createSurveyBlocks()
];

POST.apiDoc = {
  description: 'Insert new survey blocks.',
  tags: ['block'],
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
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['blocks'],
          properties: {
            blocks: {
              type: 'array',
              items: surveyBlockSchema,
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Survey block added OK.'
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

export function createSurveyBlocks(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const { blocks } = req.body as PostSurveyBlocksRequest;

      const surveyBlockService = new SurveyBlockService(connection);

      await surveyBlockService.insertSurveyBlocks(surveyId, blocks);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'createSurveyBlocks', message: 'error', error });
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
  getSurveyBlocksForSurveyId()
];

GET.apiDoc = {
  description: 'Get survey blocks.',
  tags: ['block'],
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
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string',
        description:
          'A keyword to search for in the Survey block name or description. If provided, pagination will be ignored.'
      },
      required: false
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of survey blocks.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              blocks: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_block_id', 'survey_id', 'name', 'description', 'sample_block_count'],
                  properties: {
                    survey_block_id: {
                      type: 'number',
                      description: 'Primary key of the block'
                    },
                    survey_id: {
                      type: 'number',
                      description: 'Survey of the block'
                    },
                    name: {
                      type: 'string',
                      description: 'Name of the block'
                    },
                    description: {
                      type: 'string',
                      description: 'Description of the block',
                      nullable: true
                    },
                    sample_block_count: {
                      type: 'number',
                      description: 'The number of sampling sites referencing the block'
                    },
                    revision_count: { type: 'number' }
                  }
                }
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
 * Get all survey blocks, paginated or filtered by keyword, for the given survey
 *
 * @returns {RequestHandler}
 */
export function getSurveyBlocksForSurveyId(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);

      const keyword = req.query.keyword as string | undefined;

      const paginationOptions = makePaginationOptionsFromRequest(req);

      await connection.open();

      const surveyBlockService = new SurveyBlockService(connection);

      const blocks = await surveyBlockService.getSurveyBlocksForSurveyId(surveyId, {
        keyword: keyword,
        pagination: ensureCompletePaginationOptions(paginationOptions)
      });

      const blocksTotalCount = await surveyBlockService.getSurveyBlocksCountBySurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({
        blocks,
        pagination: makePaginationResponse(blocksTotalCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyBlocks', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
