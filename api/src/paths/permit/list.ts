import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PermitService } from '../../services/permit-service';
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

export function getAllPermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const permitService = new PermitService(connection);

      const getPermitsData = await permitService.getAllPermits(systemUserId);

      await connection.commit();

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
