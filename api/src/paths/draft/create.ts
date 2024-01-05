import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { PostPutDraftObject } from '../../models/draft-create';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { DraftService } from '../../services/draft-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/draft');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),

  createDraft()
];

POST.apiDoc = {
  description: 'Create a new Draft.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Draft post request object.',
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
              title: 'JSON data associated with the draft',
              type: 'object'
            }
          }
        }
      }
    }
  },
  responses: {
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
 * Creates a new draft record.
 *
 * @returns {RequestHandler}
 */
export function createDraft(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedDraft = new PostPutDraftObject(req.body);

    try {
      await connection.open();

      const draftService = new DraftService(connection);

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const draft = await draftService.createDraft(systemUserId, sanitizedDraft);

      await connection.commit();

      return res.status(200).json(draft);
    } catch (error) {
      defaultLog.error({ label: 'createDraft', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
