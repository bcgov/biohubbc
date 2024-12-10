import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { GeoJSONFeature } from '../../../../../../../openapi/schemas/geoJson';
import { surveyBlockSchema } from '../../../../../../../openapi/schemas/survey';
import { PostSurveyBlock } from '../../../../../../../repositories/survey-block-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { SurveyBlockService } from '../../../../../../../services/survey-block-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/block/{surveyBlockId}');

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
  getSurveyBlockById()
];

GET.apiDoc = {
  description: 'Get a specific survey block by its id',
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
      in: 'path',
      name: 'surveyBlockId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey block object',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['survey_block_id', 'survey_id', 'name', 'description', 'geojson', 'sample_block_count'],
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
              geojson: { ...(GeoJSONFeature as object), description: 'Geometry of the block', nullable: true },
              sample_block_count: {
                type: 'number',
                description: 'The number of sampling sites referencing the block'
              },
              revision_count: { type: 'number' }
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
 * Get a specific survey block by its id
 *
 * @returns {RequestHandler}
 */
export function getSurveyBlockById(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const surveyId = Number(req.params.surveyId);
      const surveyBlockId = Number(req.params.surveyBlockId);

      await connection.open();

      const surveyBlockService = new SurveyBlockService(connection);

      const block = await surveyBlockService.getSurveyBlockById(surveyId, surveyBlockId);

      await connection.commit();

      return res.status(200).json(block);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyBlocks', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
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
  updateSurveyBlock()
];

PUT.apiDoc = {
  description: 'Update survey block',
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
    },
    {
      in: 'path',
      name: 'surveyBlockId',
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
        schema: surveyBlockSchema
      }
    }
  },
  responses: {
    204: {
      description: 'Survey block updated OK.'
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

export function updateSurveyBlock(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const block = req.body as PostSurveyBlock;

      const surveyBlockService = new SurveyBlockService(connection);

      await surveyBlockService.upsertSurveyBlocks(surveyId, [block]);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveyBlock', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
