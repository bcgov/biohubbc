import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { BctwService, IBctwUser } from '../../services/bctw-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry/code');

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
  getCodeValues()
];

GET.apiDoc = {
  description: 'Get a list of "code" values from the exterior telemetry system.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Generic telemetry code response.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                code_header_title: { type: 'string' },
                code_header_name: { type: 'string' },
                description: { type: 'string' },
                long_description: { type: 'string' }
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
  }
};

export function getCodeValues(): RequestHandler {
  return async (req, res) => {
    const user: IBctwUser = {
      keycloak_guid: req.system_user?.user_guid,
      username: req.system_user?.user_identifier
    };
    const bctwService = new BctwService(user);
    const codeHeader = String(req.query.codeHeader);
    try {
      const result = await bctwService.getCode(codeHeader);
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getCodeValues', message: 'error', error });
      throw error;
    }
  };
}
