import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { UserService } from '../../../../services/user-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/system-roles/create');

export const POST: Operation = [
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
  getAddSystemRolesHandler()
];

POST.apiDoc = {
  description: 'Add system roles to a user.',
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
    description: 'Add system roles to a user request object.',
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

export function getAddSystemRolesHandler(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getAddSystemRolesHandler',
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

      // Filter out any system roles that have already been added to the user
      const rolesToAdd = roles.filter((role) => !userObject.role_ids.includes(role));

      if (!rolesToAdd.length) {
        // No new system roles to add, do nothing
        return res.status(200).send();
      }

      await userService.addUserSystemRoles(userId, roles);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'getAddSystemRolesHandler', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
