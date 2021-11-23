import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400} from '../../../../errors/CustomError';
import { UserObject } from '../../../../models/user';
import { postSystemRolesSQL } from '../../../../queries/users/system-role-queries';
import { getUserByIdSQL } from '../../../../queries/users/user-queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/system-roles/update');

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
  updateSystemRolesHandler()
];

POST.apiDoc = {
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
    defaultLog.debug({ label: 'updateSystemRoles', message: 'params', req_params: req.params, req_body: req.body });

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

      console.log(userObject);


      //TODO : delete existing role (if there is one)
      // TODO: add a new role to the user


      // Filter out any system roles that have already been added to the user
      //const rolesToRemove = roles.filter((role) => !userObject.role_ids.includes(role));

      // if (!rolesToAdd.length) {
      //   // No new system roles to add, do nothing
      //   return res.status(200).send();
      // }


      // Filter out any system roles that have already been added to the user
      //const rolesToAdd = roles.filter((role) => !userObject.role_ids.includes(role));

      // if (!rolesToAdd.length) {
      //   // No new system roles to add, do nothing
      //   return res.status(200).send();
      // }



      await addSystemRoles(userId, roles, connection);
      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'addSystemRoles', message: 'error', error });
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
export const addUserSystemRole = async (userId: number, roleIds: number[], connection: IDBConnection) => {
  const postSystemRolesSqlStatement = postSystemRolesSQL(userId, roleIds);

  if (!postSystemRolesSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const postSystemRolesResponse = await connection.query(
    postSystemRolesSqlStatement.text,
    postSystemRolesSqlStatement.values
  );

  if (!postSystemRolesResponse || !postSystemRolesResponse.rowCount) {
    throw new HTTP400('Failed to add system roles');
  }
};
