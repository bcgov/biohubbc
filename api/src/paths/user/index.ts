import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { systemUserSchema } from '../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/index');

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
  getUsers()
];

GET.apiDoc = {
  description: 'Get users.',
  tags: ['users'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Users response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...systemUserSchema
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
 * Get a list of users by search criteria.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getUsers(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      const response = await userService.getUsers(req.query);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getUsers', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
