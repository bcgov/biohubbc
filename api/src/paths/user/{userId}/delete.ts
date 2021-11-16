'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400, HTTP500 } from '../../../errors/CustomError';
import { deActivateSystemUserSQL } from '../../../queries/users/user-queries';
import { getUserByIdSQL } from '../../../queries/users/user-queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/delete');

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
  removeSystemUser()
];

DELETE.apiDoc = {
  description: 'Remove a user from the system.',
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
  responses: {
    200: {
      description: 'Remove system user from system OK.'
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

export function removeSystemUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'removeSystemUser', message: 'params', req_params: req.params });

    const userId = (req.params && Number(req.params.userId)) || null;

    if (!userId) {
      throw new HTTP400('Missing required path param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      // Get the system user
      const getUserSQLStatement = getUserByIdSQL(userId);

      if (!getUserSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getUserResponse = await connection.query(getUserSQLStatement.text, getUserSQLStatement.values);

      const userResult = (getUserResponse && getUserResponse.rowCount && getUserResponse.rows[0]) || null;

      if (!userResult) {
        throw new HTTP400('Failed to get system user');
      }

      if (userResult.user_record_end_date) {
        throw new HTTP400('The system user is not active');
      }

      const deleteSystemUserSqlStatement = deActivateSystemUserSQL(userId);

      if (!deleteSystemUserSqlStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const response = await connection.query(deleteSystemUserSqlStatement.text, deleteSystemUserSqlStatement.values);

      await connection.commit();

      const result = (response && response.rowCount) || null;

      if (!result) {
        throw new HTTP500('Failed to remove user from the system');
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'removeSystemUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
