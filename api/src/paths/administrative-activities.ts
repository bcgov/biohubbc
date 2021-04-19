import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { getAdministrativeActivitySQL } from '../queries/administrative-activity/administrative-activity-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/administrative-activity');

export const GET: Operation = [logRequest('paths/administrative-activity', 'GET'), getAdministrativeActivities()];

GET.apiDoc = {
  description: 'Get a list of administrative activities based on the provided criteria.',
  tags: ['project'],
  security: [
    {
      Bearer: READ_ROLES
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'type',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'List of administrative activities.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                // TODO finalize
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
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
function getAdministrativeActivities(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const administrativeActivityTypeName = (req.query?.type as string) || undefined;

      const sqlStatement = getAdministrativeActivitySQL(administrativeActivityTypeName);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      const result = (response && response.rows && response.rows[0]) || [];

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getAdministrativeActivities', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
