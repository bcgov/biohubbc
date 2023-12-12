import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { BctwService, getBctwUser } from '../../../services/bctw-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/telemetry/manual');

const vendor_telemetry_responses = {
  200: {
    description: 'Manual telemetry response object',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              telemetry_id: { type: 'string', format: 'uuid' },
              deployment_id: { type: 'string', format: 'uuid' },
              collar_transaction_id: { type: 'string', format: 'uuid' },
              critter_id: { type: 'string', format: 'uuid' },
              deviceid: { type: 'number' },
              latitude: { type: 'number', nullable: true },
              longitude: { type: 'number', nullable: true },
              elevation: { type: 'number', nullable: true },
              vendor: { type: 'string', nullable: true },
              acquisition_date: { type: 'string', nullable: true }
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
};

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getVendorTelemetryByDeploymentIds()
];

POST.apiDoc = {
  description: 'Get a list of vendor retrieved telemetry by deployment ids',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: vendor_telemetry_responses,
  requestBody: {
    description: 'Request body',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Telemetry for Deployment ids',
          type: 'array',
          minItems: 1,
          items: {
            title: 'Vendor telemetry deployment ids',
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
  }
};

export function getVendorTelemetryByDeploymentIds(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);
    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.getVendorTelemetryByDeploymentIds(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getManualTelemetryByDeploymentIds', message: 'error', error });
      throw error;
    }
  };
}
