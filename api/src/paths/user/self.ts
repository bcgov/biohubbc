import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { authorizeRequestHandler, getSystemUserById } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';

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
  getUser()
];

GET.apiDoc = {
  description: 'Get user details for the currently authenticated user.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'User details for the currently authenticated user.',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object',
            properties: {
              id: {
                description: 'user id',
                type: 'number'
              },
              user_identifier: {
                description: 'The unique user identifier',
                type: 'string'
              },
              record_end_date: {
                description: 'Determines if the user record has expired',
                type: 'string',
                format: 'date'
              },
              role_ids: {
                description: 'list of role ids for the user',
                type: 'array',
                items: {
                  type: 'number'
                }
              },
              role_names: {
                description: 'list of role names for the user',
                type: 'array',
                items: {
                  type: 'string'
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
 * Get a user by its user identifier.
 *
 * @returns {RequestHandler}
 */
export function getUser(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userId = connection.systemUserId();

      if (!userId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const userResult = await getSystemUserById(userId, connection);

      if (!userResult) {
        throw new HTTP400('Failed to get system user');
      }

      await connection.commit();

      return res.status(200).json(userResult);
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
