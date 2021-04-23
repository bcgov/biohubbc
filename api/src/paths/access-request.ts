'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/CustomError';
import { UserObject } from '../models/user';
import { getUserByUserIdentifierSQL } from '../queries/users/user-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import { updateAdministrativeActivity } from './administrative-activity';
import { addSystemUser } from './user';
import { addSystemRoles } from './user/{userId}/system-roles';

const defaultLog = getLogger('paths/access-request');

export const PUT: Operation = [logRequest('paths/access-request', 'POST'), updateAccessRequest()];

PUT.apiDoc = {
  description: "Update a user's system access request and add any specified system roles to the user.",
  tags: ['user'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['userIdentifier', 'identitySource', 'requestId', 'requestStatusTypeId'],
          properties: {
            userIdentifier: {
              type: 'string',
              description: 'The user identifier for the user.'
            },
            identitySource: {
              type: 'string',
              description: 'The identity source for the user.'
            },
            requestId: {
              type: 'number',
              description: 'The id of the access request to update.'
            },
            requestStatusTypeId: {
              type: 'number',
              description: 'The status type id to set for the access request.'
            },
            roleIds: {
              type: 'array',
              items: {
                type: 'number'
              },
              description:
                'An array of role ids to add, if the access-request was approved. Ignored if the access-request was denied.'
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

function updateAccessRequest(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateAccessRequest', message: 'params', req_body: req.body });

    const userIdentifier = req.body?.userIdentifier || null;
    const identitySource = req.body?.identitySource || null;
    const administrativeActivityId = Number(req.body?.requestId) || null;
    const administrativeActivityStatusTypeId = Number(req.body?.requestStatusTypeId) || null;
    const roleIds: number[] = req.body?.roleIds || [];

    if (!userIdentifier) {
      throw new HTTP400('Missing required body param: userIdentifier');
    }

    if (!identitySource) {
      throw new HTTP400('Missing required body param: identitySource');
    }

    if (!administrativeActivityId) {
      throw new HTTP400('Missing required body param: requestId');
    }

    if (!administrativeActivityStatusTypeId) {
      throw new HTTP400('Missing required body param: requestStatusTypeId');
    }

    const getUserSQLStatement = getUserByUserIdentifierSQL(userIdentifier);

    if (!getUserSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Get the user by their user identifier (user may not exist)
      const getUserResponse = await connection.query(getUserSQLStatement.text, getUserSQLStatement.values);

      let userData = (getUserResponse && getUserResponse.rowCount && getUserResponse.rows[0]) || null;

      if (!userData) {
        // Found no existing user, add them
        userData = await addSystemUser(userIdentifier, identitySource, connection);
      }

      const userObject = new UserObject(userData);

      if (!userObject) {
        throw new HTTP500('Failed to get or add system user');
      }

      // Filter out any system roles that have already been added to the user
      const rolesToAdd = roleIds.filter((roleId) => !userObject.role_ids.includes(roleId));

      if (rolesToAdd?.length) {
        // Add any missing roles (if any)
        await addSystemRoles(userObject.id, roleIds, connection);
      }

      // Update the access request record status
      await updateAdministrativeActivity(administrativeActivityId, administrativeActivityStatusTypeId, connection);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'updateAccessRequest', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
