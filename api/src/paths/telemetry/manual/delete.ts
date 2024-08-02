import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { manual_telemetry_responses } from '.';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';
import { getLogger } from '../../../utils/logger';
import { getBctwUser } from '../../../services/bctw-service/bctw-service';
const defaultLog = getLogger('paths/telemetry/manual/delete');

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
  deleteManualTelemetry()
];

POST.apiDoc = {
  description: 'Delete manual telemetry records',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Request body',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Manual Telemetry ids to delete',
          type: 'array',
          minItems: 1,
          items: {
            title: 'telemetry manual ids',
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
  },
  responses: manual_telemetry_responses
};

export function deleteManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);

    const bctwTelemetryService = new BctwTelemetryService(user);
    try {
      const result = await bctwTelemetryService.deleteManualTelemetry(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'deleteManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}
