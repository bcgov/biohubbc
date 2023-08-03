import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { DraftService } from '../services/draft-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/funding-sources');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getFundingSources()
];

GET.apiDoc = {
  description: 'Get all funding sources.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Funding sources response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: [],
              properties: {}
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
 * Get a list of funding sources.
 *
 * @returns {RequestHandler}
 */
export function getFundingSources(): RequestHandler {
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
      defaultLog.error({ label: 'getFundingSources', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
