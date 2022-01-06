import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { addUserSystemRoles } from './{userId}/system-roles/update';
import { ensureSystemUser, getSystemUser } from '../../paths-helpers/system-user';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/add');

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
  addSystemRoleUser()
];

POST.apiDoc = {
  description: 'Add a new system user with role.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Add system user request object.',
    content: {
      'application/json': {
        schema: {
          title: 'User Response Object',
          type: 'object',
          required: ['userIdentifier', 'identitySource', 'roleId'],
          properties: {
            userIdentifier: {
              type: 'string'
            },
            identitySource: {
              type: 'string',
              enum: ['idir', 'bceid']
            },
            roleId: {
              type: 'number',
              minimum: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Add system user OK.'
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
 * Add a system user by its user identifier and role.
 *
 * @returns {RequestHandler}
 */
export function addSystemRoleUser(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const userIdentifier = req.body?.userIdentifier || null;
    const identitySource = req.body?.identitySource || null;
    const roleId = req.body?.roleId || null;

    if (!userIdentifier) {
      throw new HTTP400('Missing required body param: userIdentifier');
    }

    if (!identitySource) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!roleId) {
      throw new HTTP400('Missing required body param: roleId');
    }

    try {
      await connection.open();

      await ensureSystemUser(userIdentifier, identitySource, connection);

      await connection.commit();

      const data = await getSystemUser(userIdentifier, connection);
      if (data) {
        const roles = [roleId];
        await addUserSystemRoles(data.id, roles, connection);
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
