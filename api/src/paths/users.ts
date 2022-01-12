import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { UserService } from '../services/user-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/user');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getUserList()
];

GET.apiDoc = {
  description: 'Get all Users.',
  tags: ['user'],
  security: [
    {
      Bearer: []
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
                id: {
                  type: 'number'
                },
                user_identifier: {
                  type: 'string'
                },
                role_ids: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                role_names: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
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
 * Get all users.
 *
 * @returns {RequestHandler}
 */
export function getUserList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      const response = await userService.listSystemUsers();

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getUserList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
