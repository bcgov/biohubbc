import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection, IDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/CustomError';
import { addSystemUserSQL } from '../queries/users/user-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/user');

export const POST: Operation = [logRequest('paths/user', 'POST'), addUser()];

POST.apiDoc = {
  description: 'Add a new system user.',
  tags: ['user'],
  security: [
    {
      Bearer: WRITE_ROLES
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
function addUser(): RequestHandler {
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
      const addSystemUserSQLStatement = addSystemUserSQL(userIdentifier, identitySource);

      if (!addSystemUserSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(addSystemUserSQLStatement.text, addSystemUserSQLStatement.values);

      await connection.commit();

      const result = (response && response.rows && response.rows[0]) || null;

      if (!result) {
        throw new HTTP500('Failed to add system user');
      }

      return res.status(200).json();
    } catch (error) {
      defaultLog.debug({ label: 'getUser', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Adds a new system user.
 *
 * Note: Does not account for the user already existing.
 *
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @param {IDBConnection} connection
 */
export const addSystemUser = async (userIdentifier: string, identitySource: string, connection: IDBConnection) => {
  const addSystemUserSQLStatement = addSystemUserSQL(userIdentifier, identitySource);

  if (!addSystemUserSQLStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(addSystemUserSQLStatement.text, addSystemUserSQLStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP500('Failed to add system user');
  }

  return result;
};
