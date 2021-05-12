'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../database/db';
import { HTTP400, HTTP500 } from '../../../errors/CustomError';
import { UserObject } from '../../../models/user';
import { deleteSystemRolesSQL, postSystemRolesSQL } from '../../../queries/users/system-role-queries';
import { getUserByIdSQL } from '../../../queries/users/user-queries';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';

const defaultLog = getLogger('paths/user/{userId}/system-roles');

export const POST: Operation = [logRequest('paths/user/{userId}/system-roles', 'POST'), getAddSystemRolesHandler()];

POST.apiDoc = {
  description: 'Add system roles to a user.',
  tags: ['user'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
    defaultLog.debug({ label: 'addSystemRoles', message: 'params', req_params: req.params, req_body: req.body });

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

      // Get the system user and their current roles
      const getUserSQLStatement = getUserByIdSQL(userId);

      if (!getUserSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const getUserResponse = await connection.query(getUserSQLStatement.text, getUserSQLStatement.values);

      const userResult = (getUserResponse && getUserResponse.rowCount && getUserResponse.rows[0]) || null;

      if (!userResult) {
        throw new HTTP400('Failed to get system user');
      }

      const userObject = new UserObject(userResult);

      // Filter out any system roles that have already been added to the user
      const rolesToAdd = roles.filter((role) => !userObject.role_ids.includes(role));

      if (!rolesToAdd.length) {
        // No new system roles to add, do nothing
        return res.status(200).send();
      }

      await addSystemRoles(userId, roles, connection);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'addSystemRoles', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Adds the specified roleIds to the user.
 *
 * Note: Does not account for any existing roles the user may already have.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @param {IDBConnection} connection
 */
export const addSystemRoles = async (userId: number, roleIds: number[], connection: IDBConnection) => {
  const postSystemRolesSqlStatement = postSystemRolesSQL(userId, roleIds);

  if (!postSystemRolesSqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const postSystemRolesResponse = await connection.query(
    postSystemRolesSqlStatement.text,
    postSystemRolesSqlStatement.values
  );

  const systemRolesResult = (postSystemRolesResponse && postSystemRolesResponse.rowCount) || null;

  if (!systemRolesResult) {
    throw new HTTP400('Failed to add system roles');
  }
};

export const DELETE: Operation = [logRequest('paths/user/{userId}/system-roles', 'DELETE'), removeSystemRoles()];

DELETE.apiDoc = {
  description: 'Remove system roles from a user.',
  tags: ['user'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
    },
    {
      in: 'query',
      name: 'roleId',
      schema: {
        type: 'array',
        items: {
          type: 'number'
        }
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Remove system user roles from user OK.'
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

function removeSystemRoles(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'removeSystemRoles', message: 'params', req_params: req.params, req_body: req.body });

    const userId = Number(req.params?.userId) || null;
    const roleIds: number[] = (req.query?.roleId as string[]).map((item: any) => Number(item)) || [];

    if (!userId) {
      throw new HTTP400('Missing required path param: userId');
    }

    if (!roleIds?.length) {
      throw new HTTP400('Missing required body param: roles');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const sqlStatement = deleteSystemRolesSQL(userId, roleIds);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      const result = (response && response.rowCount) || null;

      if (!result) {
        throw new HTTP500('Failed to remove system roles');
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'removeSystemRoles', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
