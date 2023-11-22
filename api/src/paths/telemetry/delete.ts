import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { manual_telemetry_responses } from '.';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BctwService, IBctwUser } from '../../services/bctw-service';
import { getLogger } from '../../utils/logger';
const defaultLog = getLogger('paths/telemetry/delete');

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
          title: 'Manual Telemetry delete request object',
          type: 'object',
          required: ['telemetry_manual_ids'],
          properties: {
            telemetry_manual_ids: {
              type: 'array',
              minItems: 1,
              items: {
                title: 'telemetry_manual_ids',
                type: 'string',
                format: 'uuid'
              }
            }
          }
        }
      }
    }
  },
  responses: manual_telemetry_responses
};

export function deleteManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.deleteManualTelemetry(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'deleteManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}
