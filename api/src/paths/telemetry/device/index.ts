import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { BctwService, IBctwUser } from '../../../services/bctw-service';
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
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const bctwService = new BctwService(user);
    try {
      const results = await bctwService.updateDevice(req.body);
      return res.status(200).json(results);
    } catch (error) {
      defaultLog.error({ label: 'upsertDevice', message: 'error', error });
      throw error;
    }
  };
}
