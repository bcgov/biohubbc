import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { manual_telemetry_responses } from '.';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getBctwUser } from '../../../services/bctw-service/bctw-service';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/telemetry/manual');

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
  getManualTelemetryByDeploymentIds()
];

POST.apiDoc = {
  description: 'Get a list of manually created telemetry by deployment ids',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: manual_telemetry_responses,
  requestBody: {
    description: 'Request body',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Manual Telemetry deployment ids',
          type: 'array',
          minItems: 1,
          items: {
            title: 'Manual telemetry deployment ids',
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
  }
};

export function getManualTelemetryByDeploymentIds(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);

    const bctwService = new BctwTelemetryService(user);

    try {
      const result = await bctwService.getManualTelemetryByDeploymentIds(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getManualTelemetryByDeploymentIds', message: 'error', error });
      throw error;
    }
  };
}
