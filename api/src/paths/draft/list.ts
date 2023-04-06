import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { draftResponseObject } from '../../openapi/schemas/draft';
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
              ...(draftResponseObject as object)
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
      defaultLog.error({ label: 'getDraftsList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
