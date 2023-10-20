import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { PostPutDraftObject } from '../../../models/draft-create';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { DraftService } from '../../../services/draft-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/draft');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          draftId: Number(req.params.draftId),
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateDraft()
];

const postPutResponses = {
  200: {
    description: 'Draft post response object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft Response Object',
          type: 'object',
          required: ['webform_draft_id', 'name', 'create_date', 'update_date'],
          properties: {
            webform_draft_id: {
              type: 'number'
            },
            name: {
              type: 'string',
              description: 'The name of the draft'
            },
            create_date: {
              oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
              description: 'ISO 8601 date string for the date the draft was created'
            },
            update_date: {
              oneOf: [
                { type: 'object', nullable: true },
                { type: 'string', format: 'date' }
              ],
              description: 'ISO 8601 date string for the date the draft was updated'
            }
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
};

PUT.apiDoc = {
  description: 'Update a Draft',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Draft put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Draft request object',
          type: 'object',
          required: ['name', 'data'],
          properties: {
            name: {
              title: 'Draft name',
              type: 'string'
            },
            data: {
              title: 'Draft json data',
              type: 'object'
            }
          }
        }
      }
    }
  },
  responses: {
    ...postPutResponses
  }
};

/**
 * Updates an existing draft record.
 *
 * @returns {RequestHandler}
 */
export function updateDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedDraft = new PostPutDraftObject(req.body);

    try {
      await connection.open();

      const draftService = new DraftService(connection);

      const draft = await draftService.updateDraft(Number(req.params.draftId), sanitizedDraft);

      await connection.commit();

      return res.status(200).json(draft);
    } catch (error) {
      defaultLog.error({ label: 'updateDraft', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
