import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { DraftService } from '../../services/draft-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/draft/list');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getDraftList()
];

GET.apiDoc = {
  description: 'Get all Drafts.',
  tags: ['draft'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Draft response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
  }
};

/**
 * Gets a list of existing draft records.
 *
 * @returns {RequestHandler}
 */
export function getDraftList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const draftService = new DraftService(connection);

      const drafts = await draftService.getDraftList(systemUserId);

      await connection.commit();

      return res.status(200).json(drafts);
    } catch (error) {
      defaultLog.error({ label: 'getDraftList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
