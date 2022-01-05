import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { queries } from '../../queries/queries';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/permits/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getAllPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of all permits by system user id.',
  tags: ['permits'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Permits get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Permit Get Response Object',
              type: 'object',
              properties: {
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                },
                coordinator_agency: {
                  type: 'string'
                },
                project_name: {
                  type: 'string'
                }
              }
            },
            description: 'All permits in the permits table for the appropriate system user'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getAllPermits(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get permits list', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const getPermitsSQLStatement = queries.permit.getAllPermitsSQL(systemUserId);

      if (!getPermitsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const permitsData = await connection.query(getPermitsSQLStatement.text, getPermitsSQLStatement.values);

      await connection.commit();

      const getPermitsData = (permitsData && permitsData.rows) || null;

      return res.status(200).json(getPermitsData);
    } catch (error) {
      defaultLog.error({ label: 'getAllPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
