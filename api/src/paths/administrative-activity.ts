import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { administrativeActivityResponseObject } from '../openapi/schemas/administrative-activity';
import { postAdministrativeActivitySQL } from '../queries/administrative-activity-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [logRequest('paths/administrative-activity', 'POST'), createAdministrativeActivity()];

const postPutResponses = {
  200: {
    description: 'Administrative activity post response object.',
    content: {
      'application/json': {
        schema: {
          ...(administrativeActivityResponseObject as object)
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
};

POST.apiDoc = {
  description: 'Create a new Administrative Activity.',
  tags: ['access request'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Administrative Activity post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              title: 'Administrative Activity json data',
              type: 'object',
              properties: {}
            }
          }
        }
      }
    }
  },
  responses: {
    ...postPutResponses
  }
};

/**
 * Creates a new access request record.
 *
 * @returns {RequestHandler}
 */
function createAdministrativeActivity(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      //const systemUserId = connection.systemUserId();
      const systemUserId = 1;
      // if (!systemUserId) {
      //   throw new HTTP400('Failed to identify system user ID');
      // }

      const postAdministrativeActivitySQLStatement = postAdministrativeActivitySQL(systemUserId, req?.body?.data);

      if (!postAdministrativeActivitySQLStatement) {
        throw new HTTP400('Failed to build SQL insert statement');
      }

      const createAdministrativeActivityResponse = await connection.query(
        postAdministrativeActivitySQLStatement.text,
        postAdministrativeActivitySQLStatement.values
      );

      await connection.commit();

      const administrativeActivityResult =
        (createAdministrativeActivityResponse &&
          createAdministrativeActivityResponse.rows &&
          createAdministrativeActivityResponse.rows[0]) ||
        null;

      if (!administrativeActivityResult || !administrativeActivityResult.id) {
        throw new HTTP400('Failed to submit administrative activity');
      }

      return res
        .status(200)
        .json({ id: administrativeActivityResult.id, date: administrativeActivityResult.create_date });
    } catch (error) {
      defaultLog.debug({ label: 'administrativeActivity', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
