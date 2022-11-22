import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { SecuritySearchService } from '../../services/security-search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/security/list');

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
  getRules()
];

GET.apiDoc = {
  description: 'Get all Security Rules.',
  tags: ['security'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            security_ids: {
              type: 'array',
              items: {
                type: 'number'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Security objects.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object'
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getRules(): RequestHandler {
  return async (req, res) => {
    try {
      const service = new SecuritySearchService();
      // req.body.security_ids
      const response = await service.getPersecutionSecurityRules();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSecurityRules', message: 'error', error });
      throw error;
    }
  };
}
