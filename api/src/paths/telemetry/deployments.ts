import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { surveyTelemetrySchema } from '../../openapi/schemas/telemetry';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BctwService, getBctwUser } from '../../services/bctw-service';
import { getLogger } from '../../utils/logger';

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
  getAllTelemetryByDeploymentIds()
];

POST.apiDoc = {
  description: 'Get list of manual and vendor telemetry by deployment ids',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Manual and Vendor telemetry response object',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: surveyTelemetrySchema
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
  },

  requestBody: {
    description: 'Request body',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'BCTW deployment ids',
          type: 'array',
          minItems: 1,
          items: {
            title: 'BCTW deployment ids',
            type: 'string',
            format: 'uuid'
          }
        }
      }
    }
  }
};

export function getAllTelemetryByDeploymentIds(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);
    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.getAllTelemetryByDeploymentIds(req.body);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllTelemetryByDeploymentIds', message: 'error', error });
      throw error;
    }
  };
}
