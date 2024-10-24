import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getBctwUser } from '../../../services/bctw-service/bctw-service';
import { BctwTelemetryService } from '../../../services/bctw-service/bctw-telemetry-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/telemetry/manual');

export const manual_telemetry_responses = {
  200: {
    description: 'Manual telemetry response object',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              telemetry_manual_id: { type: 'string' },
              deployment_id: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              acquisition_date: { type: 'string' }
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
    const user = getBctwUser(req);

    const bctwService = new BctwTelemetryService(user);
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
          type: 'array',
          minItems: 1,
          items: {
            title: 'manual telemetry records',
            type: 'object',
            additionalProperties: false,
            required: ['deployment_id', 'latitude', 'longitude', 'acquisition_date'],
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
              acquisition_date: {
                type: 'string'
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
    const user = getBctwUser(req);
    const bctwService = new BctwTelemetryService(user);
    try {
      const result = await bctwService.createManualTelemetry(req.body);
      return res.status(201).json(result);
    } catch (error) {
      defaultLog.error({ label: 'createManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}

export const PATCH: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  updateManualTelemetry()
];

PATCH.apiDoc = {
  description: 'Bulk update Manual Telemetry',
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
          title: 'Manual Telemetry update objects',
          type: 'array',
          minItems: 1,
          items: {
            title: 'manual telemetry records',
            type: 'object',
            additionalProperties: false,
            required: ['telemetry_manual_id'],
            minProperties: 2,
            properties: {
              telemetry_manual_id: {
                type: 'string',
                format: 'uuid'
              },
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
              acquisition_date: {
                type: 'string'
              }
            }
          }
        }
      }
    }
  }
};

export function updateManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);
    const bctwService = new BctwTelemetryService(user);
    try {
      const result = await bctwService.updateManualTelemetry(req.body);
      return res.status(201).json(result);
    } catch (error) {
      defaultLog.error({ label: 'updateManualTelemetry', message: 'error', error });
      throw error;
    }
  };
}
