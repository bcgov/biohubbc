import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { draftResponseObject } from '../openapi/schemas/draft';
import { getDraftsSQL } from '../queries/draft-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/drafts');

export const GET: Operation = [logRequest('paths/drafts', 'GET'), getDraftList()];

GET.apiDoc = {
  description: 'Get all Drafts.',
  tags: ['draft'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const getDraftsSQLStatement = getDraftsSQL(systemUserId);

      if (!getDraftsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const getDraftsResponse = await connection.query(getDraftsSQLStatement.text, getDraftsSQLStatement.values);

      const draftResult = (getDraftsResponse && getDraftsResponse.rows) || null;

      if (!draftResult) {
        throw new HTTP400('Failed to get drafts');
      }

      await connection.commit();

      return res.status(200).json(draftResult);
    } catch (error) {
      defaultLog.debug({ label: 'getDraftsList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
