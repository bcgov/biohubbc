import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { getUserListSQL } from '../queries/users/user-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/user');

export const GET: Operation = [logRequest('paths/user', 'GET'), getUserList()];

GET.apiDoc = {
  description: 'Get all Users.',
  tags: ['user'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  responses: {
    200: {
      description: 'User response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'User Response Object',
              type: 'object',
              properties: {
                // TODO needs finalizing (here and in the user-queries.ts SQL)
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
 * Get all users.
 *
 * @returns {RequestHandler}
 */
function getUserList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getUserListSQLStatement = getUserListSQL();

      if (!getUserListSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getUserListResponse = await connection.query(getUserListSQLStatement.text, getUserListSQLStatement.values);

      await connection.commit();

      return res.status(200).json(getUserListResponse && getUserListResponse.rows);
    } catch (error) {
      defaultLog.debug({ label: 'getUserList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
