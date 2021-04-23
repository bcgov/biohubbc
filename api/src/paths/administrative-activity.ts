import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/CustomError';
import {
  administrativeActivityResponseObject,
  hasPendingAdministrativeActivitiesResponseObject
} from '../openapi/schemas/administrative-activity';
import {
  postAdministrativeActivitySQL,
  countPendingAdministrativeActivitiesSQL
} from '../queries/administrative-activity/administrative-activity-queries';
import { getUserIdentifier } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [logRequest('paths/administrative-activity', 'POST'), createAdministrativeActivity()];
export const GET: Operation = [logRequest('paths/administrative-activity', 'GET'), getPendingAccessRequestsCount()];

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

const getResponses = {
  200: {
    description: '`Has Pending Administrative Activities` get response object.',
    content: {
      'application/json': {
        schema: {
          ...(hasPendingAdministrativeActivitiesResponseObject as object)
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
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    ...postPutResponses
  }
};

GET.apiDoc = {
  description: 'Has one or more pending Administrative Activities.',
  tags: ['access request'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity get request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    ...getResponses
  }
};

/**
 * Creates a new access request record.
 *
 * @returns {RequestHandler}
 */
function createAdministrativeActivity(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const postAdministrativeActivitySQLStatement = postAdministrativeActivitySQL(systemUserId, req?.body);

      if (!postAdministrativeActivitySQLStatement) {
        throw new HTTP500('Failed to build SQL insert statement');
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
        throw new HTTP500('Failed to submit administrative activity');
      }

      return res
        .status(200)
        .json({ id: administrativeActivityResult.id, date: administrativeActivityResult.create_date });
    } catch (error) {
      defaultLog.error({ label: 'administrativeActivity', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
function getPendingAccessRequestsCount(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const userIdentifier = getUserIdentifier(req['keycloak_token']);

      if (!userIdentifier) {
        throw new HTTP400('Missing required query param : userIdentifier ');
      }

      const sqlStatement = countPendingAdministrativeActivitiesSQL(userIdentifier);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      const result = (response && response.rowCount) || 0;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getPendingAccessRequestsCount', message: 'error', error });

      throw error;
    } finally {
      connection.release();
    }
  };
}
