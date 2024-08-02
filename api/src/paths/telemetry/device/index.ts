import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getBctwUser } from '../../../services/bctw-service';
import { BctwDeviceService } from '../../../services/bctw-service/bctw-device-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/telemetry/device/{deviceId}');

export const POST: Operation = [
  // TODO: Should this endpoint be guarded such that the user must at the very least belong to a project?
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  upsertDevice()
];

POST.apiDoc = {
  description: 'Upsert device metadata inside BCTW.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Device body',
    content: {
      'application/json': {
        schema: {
          properties: {
            collar_id: {
              type: 'string',
              format: 'uuid'
            },
            device_id: {
              type: 'integer'
            },
            device_make: {
              type: 'string'
            },
            device_model: {
              type: 'string',
              nullable: true
            },
            frequency: {
              type: 'number',
              nullable: true
            },
            frequency_unit: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Resultant object of upsert.',
      content: {
        'application/json': {
          schema: {
            type: 'object'
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

export function upsertDevice(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);

    const bctwDeviceService = new BctwDeviceService(user);
    try {
      const results = await bctwDeviceService.updateDevice(req.body);
      return res.status(200).json(results);
    } catch (error) {
      defaultLog.error({ label: 'upsertDevice', message: 'error', error });
      throw error;
    }
  };
}
