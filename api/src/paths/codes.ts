import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { getAllCodeSets } from '../utils/code-utils';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/code');

export const GET: Operation = [logRequest('paths/code', 'POST'), getAllCodes()];

GET.apiDoc = {
  description: 'Get all Codes.',
  tags: ['code'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  responses: {
    200: {
      description: 'Code response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              management_action_type: {
                type: 'array',
                items: {
                  type: 'object'
                }
              },
              climate_change_initiative: {
                type: 'array',
                items: {
                  type: 'object'
                }
              },
              land_based_investment_strategy: {
                type: 'array',
                items: {
                  type: 'object'
                }
              },
              funding_agency: {
                type: 'array',
                items: {
                  type: 'object'
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all codes.
 *
 * @returns {RequestHandler}
 */
function getAllCodes(): RequestHandler {
  return async (req, res) => {
    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const allCodeSets = await getAllCodeSets(connection);

      if (!allCodeSets) {
        throw {
          status: 500,
          message: 'Failed to fetch codes'
        };
      }

      return res.status(200).json(allCodeSets);
    } catch (error) {
      defaultLog.debug({ label: 'getAllCodes', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
