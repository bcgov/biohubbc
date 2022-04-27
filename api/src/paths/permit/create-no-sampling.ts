import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { permitNoSamplingPostBody, permitNoSamplingResponseBody } from '../../openapi/schemas/permit-no-sampling';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PermitService } from '../../services/permit-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/permit/create-no-sampling');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  createNoSamplePermits()
];

POST.apiDoc = {
  description: 'Creates new no sample permit records.',
  tags: ['no-sample-permit'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'No sample permits post request object.',
    content: {
      'application/json': {
        schema: {
          ...(permitNoSamplingPostBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'No sample permits response object.',
      content: {
        'application/json': {
          schema: {
            ...(permitNoSamplingResponseBody as object)
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
 * Creates new no sample permit records.
 *
 * @returns {RequestHandler}
 */
export function createNoSamplePermits(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const permitService = new PermitService(connection);

      const result = await permitService.createNoSamplePermits(req.body);

      await connection.commit();

      return res.status(200).json({ ids: result });
    } catch (error) {
      defaultLog.error({ label: 'createNoSamplePermits', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
