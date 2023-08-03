import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { FundingSourceService } from '../services/funding-source-service';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/funding-sources');

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
  getFundingSources()
];

GET.apiDoc = {
  description: 'Get all funding sources.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Funding sources response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['funding_source_id', 'name', 'description'],
              properties: {
                funding_source_id: {
                  type: 'integer',
                  minimum: 1
                },
                name: {
                  type: 'string'
                },
                description: {
                  type: 'string'
                }
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

/**
 * Get a list of funding sources.
 *
 * @returns {RequestHandler}
 */
export function getFundingSources(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const fundingSourceService = new FundingSourceService(connection);

      const response = await fundingSourceService.getFundingSources();

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getFundingSources', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
