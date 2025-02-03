import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ISystemUserFilterObject } from '../../models/system-user-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { systemUserSchema } from '../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/user/list');

export const GET: Operation = [
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
  getUserList()
];

GET.apiDoc = {
  description: 'Get all Users.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'system_user_ids',
      required: false,
      schema: {
        type: 'array',
        items: {
          description: 'The primary key of a system user to filter results with',
          type: 'integer',
          minimum: 1
        }
      }
    },
    {
      in: 'query',
      name: 'system_roles',
      required: false,
      schema: {
        type: 'array',
        items: {
          description:
            'The name of a system role, such as Creator, System Administrator, or Data Administrator to filter results with',
          type: 'string'
        }
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'User response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'Response object containing system users',
            additionalProperties: false,
            required: ['users'],
            properties: {
              users: { type: 'array', description: 'Array of system users', items: systemUserSchema },
              pagination: { ...paginationResponseSchema }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
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
 * Get system users with filter parameters
 *
 * @returns {RequestHandler}
 */
export function getUserList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getUserList' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const filterObject = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const userService = new UserService(connection);

      const [users, usersTotalCount] = await Promise.all([
        userService.listSystemUsers(filterObject, ensureCompletePaginationOptions(paginationOptions)),
        userService.getSystemUsersCount(filterObject)
      ]);

      await connection.commit();

      return res.status(200).json({ users, pagination: makePaginationResponse(usersTotalCount, paginationOptions) });
    } catch (error) {
      defaultLog.error({ label: 'getUserList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, ISystemUserFilterObject>} req
 * @return {*}  {ISystemUserFilterObject}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, ISystemUserFilterObject>): ISystemUserFilterObject {
  return {
    system_user_ids: req.query.system_user_ids ?? [],
    system_roles: req.query.system_roles ?? []
  };
}
