import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { AllTelemetrySchema } from '../../openapi/schemas/telemetry';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getBctwUser } from '../../services/bctw-service/bctw-service';
import { BctwTelemetryService } from '../../services/bctw-service/bctw-telemetry-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry/deployments');

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
      name: 'bctwDeploymentIds',
      schema: {
        type: 'array',
        items: { type: 'string', format: 'uuid', minimum: 1 }
      },
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
            items: AllTelemetrySchema
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
      const bctwDeploymentIds = req.query.bctwDeploymentIds as string[];

      const result = await bctwTelemetryService.getAllTelemetryByDeploymentIds(bctwDeploymentIds);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllTelemetryByDeploymentIds', message: 'error', error });
      throw error;
    }
  };
}
