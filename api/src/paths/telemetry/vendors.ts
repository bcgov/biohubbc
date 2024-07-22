import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BctwService, getBctwUser } from '../../services/bctw-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry/vendors');

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
  getCollarVendors()
];

GET.apiDoc = {
  description: 'Get a list of supported collar vendors.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Collar vendors response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'string'
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
  }
};

export function getCollarVendors(): RequestHandler {
  return async (req, res) => {
    const user = getBctwUser(req);

    const bctwService = new BctwService(user);
    try {
      const result = await bctwService.getCollarVendors();
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getCollarVendors', message: 'error', error });
      throw error;
    }
  };
}
