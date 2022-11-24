import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { SecuritySearchService } from '../../services/security-search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/security/get');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
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
