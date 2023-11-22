import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BctwService, IBctwUser } from '../../services/bctw-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry');

export const manual_telemetry_responses = {
  200: {
    description: 'Manual telemetry response object',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              telemetry_manual_id: { type: 'string' },
              deployment_id: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              date: { type: 'string' }
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
  getManualTelemetry()
];

GET.apiDoc = {
  description: 'Get a list of manually created telemetry',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: manual_telemetry_responses
};

export function getManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.getManualTelemetry();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}

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
  createManualTelemetry()
];

POST.apiDoc = {
  description: 'Bulk create Manual Telemetry',
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
          title: 'Manual Telemetry create objects',
          type: 'object',
          properties: {
            telemetry: {
              type: 'array',
              minItems: 1,
              items: {
                title: 'manual telemetry records',
                type: 'object',
                required: ['deployment_id', 'latitude', 'longitude', 'date'],
                properties: {
                  deployment_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  latitude: {
                    type: 'number'
                  },
                  longitude: {
                    type: 'number'
                  },
                  date: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export function createManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.createManualTelemetry(req.body.telemetry);
      return res.status(201).json(result);
    } catch (error) {
      defaultLog.error({ label: 'createManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}
