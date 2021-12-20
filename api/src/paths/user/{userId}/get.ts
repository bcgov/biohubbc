import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { getUserByIdSQL } from '../../../queries/users/user-queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}');

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
  getUserById()
];

GET.apiDoc = {
  description: 'Get user details from userId.',
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
      description: 'User details for userId.',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object'
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
export function getUserById(): RequestHandler {
  return async (req, res) => {
    if (!req.params) {
      throw new HTTP400('Missing required p      arams');
    }

    if (!req.params.userId) {
      throw new HTTP400('Missing required param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const userId = Number(req.params.userId);

      await connection.open();

      const getUserbyIdSQLStatement = getUserByIdSQL(userId);

      if (!getUserbyIdSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const response = await connection.query(getUserbyIdSQLStatement.text, getUserbyIdSQLStatement.values);

      await connection.commit();

      const result = (response && response.rows && response.rows[0]) || null;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
