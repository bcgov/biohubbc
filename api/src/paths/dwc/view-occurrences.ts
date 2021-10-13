import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';
import { getOccurrencesForViewSQL } from '../../queries/occurrence/occurrence-view-queries';
import { GetOccurrencesViewData } from '../../models/occurrence-view';

const defaultLog = getLogger('paths/dwc/view-occurrences');

export const POST: Operation = [logRequest('paths/dwc/view-occurrences', 'POST'), getOccurrencesForView()];

POST.apiDoc = {
  description: 'Get occurrence spatial and metadata, for view-only purposes.',
  tags: ['occurrences'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['occurrence_submission_id'],
          properties: {
            occurrence_submission_id: {
              description: 'A survey occurrence submission ID',
              type: 'number',
              example: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Occurrences spatial and metadata response.',
      content: {
        'application/json': {
          schema: {
            title: 'Occurrences spatial and metadata response object, for view purposes',
            type: 'object',
            properties: {}
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
 * Get occurrence spatial and metadata by occurrence submission id.
 *
 * @returns {RequestHandler}
 */
export function getOccurrencesForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    if (!req.body || !req.body.occurrence_submission_id) {
      throw new HTTP400('Missing required request body param `occurrence_submission_id`');
    }

    try {
      await connection.open();

      const sqlStatement = getOccurrencesForViewSQL(Number(req.body.occurrence_submission_id));

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get occurrences for view statement');
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (!response || !response.rows) {
        throw new HTTP400('Failed to get occurrences view data');
      }

      const result = new GetOccurrencesViewData(response.rows);

      await connection.commit();

      return res.status(200).json(result.occurrences);
    } catch (error) {
      defaultLog.error({ label: 'getOccurrencesForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
