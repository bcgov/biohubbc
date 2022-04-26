import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PermitService } from '../../services/permit-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/permit/get-no-sampling');

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
  getNonSamplingPermits()
];

GET.apiDoc = {
  description: 'Fetches a list of non-sampling permits.',
  tags: ['non-sampling-permits'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Non-sampling permits get response array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Non-sampling permit Get Response Object',
              type: 'object',
              properties: {
                id: {
                  type: 'number'
                },
                number: {
                  type: 'string'
                },
                type: {
                  type: 'string'
                }
              }
            },
            description: 'Non-sampling permits'
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

export function getNonSamplingPermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const permitService = new PermitService(connection);

      const getNonSamplingPermitsData = await permitService.getNonSamplingPermits(systemUserId);

      await connection.commit();

      return res.status(200).json(getNonSamplingPermitsData);
    } catch (error) {
      defaultLog.error({ label: 'getNonSamplingPermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
