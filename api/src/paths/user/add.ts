import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/http-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/add');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
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
          required: ['userIdentifier', 'identitySource', 'displayName', 'email', 'roleId'],
          properties: {
            userGuid: {
              type: 'string',
              description: 'The GUID for the user.'
            },
            userIdentifier: {
              type: 'string',
              description: 'The identifier for the user.'
            },
            identitySource: {
              type: 'string',
              enum: [
                SYSTEM_IDENTITY_SOURCE.IDIR,
                SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
                SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS
              ]
            },
            displayName: {
              type: 'string',
              description: 'The display name for the user.'
            },
            email: {
              type: 'string',
              description: 'The email for the user.'
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

    const userGuid: string | null = req.body?.userGuid || null;
    const userIdentifier: string | null = req.body?.userIdentifier || null;
    const identitySource: string | null = req.body?.identitySource || null;
    const displayName: string | null = req.body?.displayName || null;
    const email: string | null = req.body?.email || null;

    const roleId = req.body?.roleId || null;

    if (!userIdentifier) {
      throw new HTTP400('Missing required body param: userIdentifier');
    }

    if (!identitySource) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!displayName) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!email) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!roleId) {
      throw new HTTP400('Missing required body param: roleId');
    }

    try {
      await connection.open();

      const userService = new UserService(connection);

      const userObject = await userService.ensureSystemUser(
        userGuid,
        userIdentifier,
        identitySource,
        displayName,
        email
      );

      if (userObject) {
        await userService.addUserSystemRoles(userObject.id, [roleId]);
      }

      await connection.commit();

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
