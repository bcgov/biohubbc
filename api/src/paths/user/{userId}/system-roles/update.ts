import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { UserService } from '../../../../services/user-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/system-roles/update');

export const PATCH: Operation = [
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
  updateSystemRolesHandler()
];

PATCH.apiDoc = {
  description: 'Update system role for a user.',
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
  requestBody: {
    description: 'Update system role for a user request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['roles'],
          properties: {
            roles: {
              type: 'array',
              items: {
                type: 'number'
              },
              description: 'An array of role ids'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Add system user roles to user OK.'
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

export function updateSystemRolesHandler(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'updateSystemRolesHandler',
      message: 'params',
      req_params: req.params,
      req_body: req.body
    });

    if (!req.params || !req.params.userId) {
      throw new HTTP400('Missing required path param: userId');
    }

    if (!req.body || !req.body.roles || !req.body.roles.length) {
      throw new HTTP400('Missing required body param: roles');
    }

    const userId = Number(req.params.userId);
    const roles: number[] = req.body.roles;
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      const userObject = await userService.getUserById(userId);

      if (!userObject) {
        throw new HTTP400('Failed to get system user');
      }

      if (userObject.role_ids.length) {
        await userService.deleteUserSystemRoles(userId);
      }

      //add new user system roles
      await userService.addUserSystemRoles(userId, roles);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSystemRolesHandler', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
