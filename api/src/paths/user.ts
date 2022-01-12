import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { UserService } from '../services/user-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/user');

export const DELETE: Operation = [
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
  addUser()
];

DELETE.apiDoc = {
  description: 'Add a new system user.',
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
          required: ['userIdentifier', 'identitySource'],
          properties: {
            userIdentifier: {
              type: 'string'
            },
            identitySource: {
              type: 'string',
              enum: ['idir', 'bceid']
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
 * Add a system user by its user identifier.
 *
 * @returns {RequestHandler}
 */
export function addUser(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const userIdentifier = req.body?.userIdentifier || null;
    const identitySource = req.body?.identitySource || null;

    if (!userIdentifier) {
      throw new HTTP400('Missing required body param: userIdentifier');
    }

    if (!identitySource) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    try {
      await connection.open();

      const userService = new UserService(connection);

      await userService.addSystemUser(userIdentifier, identitySource);

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
