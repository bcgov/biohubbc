import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { UserService } from '../../../services/user-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/get');

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
                type: 'string'
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
export function getUserById(): RequestHandler {
  return async (req, res) => {
    if (!req.params.userId) {
      throw new HTTP400('Missing required param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const userId = Number(req.params.userId);

      await connection.open();

      const userService = new UserService(connection);

      const userObject = await userService.getUserById(userId);

      if (!userObject) {
        throw new HTTP400('Failed to get system user');
      }

      await connection.commit();

      return res.status(200).json(userObject);
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
