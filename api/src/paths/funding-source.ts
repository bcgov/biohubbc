import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/funding-source/{fundingSourceId}');

export const POST: Operation = [
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
  postFundingSource()
];

POST.apiDoc = {
  description: 'Create a funding source.',
  tags: ['funding-source'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Funding source post request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: [],
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Funding source response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: [],
              properties: {}
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
 * Create a new funding source.
 *
 * @returns {RequestHandler}
 */
export function postFundingSource(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // TODO

      await connection.commit();

      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'createFundingSource', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
