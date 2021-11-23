import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { getUserByIdSQL } from '../../../queries/users/user-queries';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/get');

export const GET: Operation = [getUser()];

GET.apiDoc = {
  description: 'Get user details for user given a userId.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'User details for a user with a userId.',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object',
            properties: {
              // TODO needs finalizing (here and in the user-queries.ts SQL)
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
 * Get a user by its user identifier.
 *
 * @returns {RequestHandler}
 */
export function getUser(): RequestHandler {
  return async (req, res) => {

    defaultLog.debug({ label: 'gerUserObject', message: 'params', req_params: req.params, req_body: req.body });
    const connection = getDBConnection(req['keycloak_token']);

    const userId = Number(req.params.userId);
    if (!userId) {
      throw new HTTP400('Failed to identify system user ID');
    }


    try {
      await connection.open();

      // Get the system user and their current roles
      const getUserSQLStatement = getUserByIdSQL(userId);

      if (!getUserSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const response = await connection.query(getUserSQLStatement.text, getUserSQLStatement.values);

      await connection.commit();

      const result = (response && response.rows && response.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
