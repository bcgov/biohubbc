import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, getServiceClientDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { UserService } from '../../services/user-service';
import { getKeycloakSource } from '../../utils/keycloak-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/add');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validServiceClientIDs: [SOURCE_SYSTEM['SIMS-SVC-4464']],
          discriminator: 'ServiceClient'
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
          required: ['userIdentifier', 'identitySource', 'displayName', 'email'],
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
                SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
                SYSTEM_IDENTITY_SOURCE.UNVERIFIED
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
            },
            given_name: {
              type: 'string',
              description: 'The given name for the user.'
            },
            family_name: {
              type: 'string',
              description: 'The family name for the user.'
            },
            role_name: {
              type: 'string'
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
    const userGuid: string | null = req.body?.userGuid || null;
    const userIdentifier: string = req.body?.userIdentifier || '';
    const identitySource: string = req.body?.identitySource || '';
    const displayName: string = req.body?.displayName || '';
    const email: string = req.body?.email || '';

    const roleId = req.body?.roleId || null;

    const given_name: string = req.body?.given_name;
    const family_name: string = req.body?.family_name;
    const role_name: string = req.body?.role_name;

    const sourceSystem = getKeycloakSource(req['keycloak_token']);

    const connection = sourceSystem
      ? getServiceClientDBConnection(sourceSystem)
      : getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userService = new UserService(connection);

      const userObject = await userService.ensureSystemUser(
        userGuid,
        userIdentifier,
        identitySource,
        displayName,
        email,
        given_name,
        family_name
      );

      if (userObject) {
        if (role_name) {
          await userService.addUserSystemRoleByName(userObject.system_user_id, role_name);
        } else {
          await userService.addUserSystemRoles(userObject.system_user_id, [roleId]);
        }
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
