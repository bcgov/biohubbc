import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getBctwUser } from '../../services/bctw-service/bctw-service';
import { BctwTelemetryService } from '../../services/bctw-service/bctw-telemetry-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getAllTelemetryByDeploymentIds()
];

GET.apiDoc = {
  description: 'Get manual and vendor telemetry for a set of deployment Ids',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'deploymentIds',
      schema: {
        type: 'array',
        items: { type: 'integer', minimum: 1 }
      },
      explode: false,
      style: 'form',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Manual and Vendor telemetry response object',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string' },
                deployment_id: { type: 'string', format: 'uuid' },
                telemetry_manual_id: { type: 'string', nullable: true },
                telemetry_id: { type: 'number', nullable: true },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                acquisition_date: { type: 'string' },
                telemetry_type: { type: 'string' }
              }
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

export function getAllTelemetryByDeploymentIds(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);

    const bctwTelemetryService = new BctwTelemetryService(user);

    try {
      const deploymentIds = req.query.deploymentIds as string[];

      const result = await bctwTelemetryService.getAllTelemetryByDeploymentIds(deploymentIds);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllTelemetryByDeploymentIds', message: 'error', error });
      throw error;
    }
  };
}
