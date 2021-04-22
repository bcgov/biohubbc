import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { READ_ROLES, WRITE_ROLES } from '../constants/roles';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/CustomError';
import {
  administrativeActivityResponseObject,
  hasPendingAdministrativeActivitiesResponseObject
} from '../openapi/schemas/administrative-activity';
import {
  postAdministrativeActivitySQL,
  countPendingAdministrativeActivitiesSQL
} from '../queries/administrative-activity-queries';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [logRequest('paths/administrative-activity', 'POST'), createAdministrativeActivity()];
export const GET: Operation = [
  logRequest('paths/administrative-activity', 'GET'),
  hasPendingAdministrativeActivities()
];

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
      Bearer: READ_ROLES
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
 * GET Has Pending Administrative Activities.
 *
 * @returns {RequestHandler}
 */
function hasPendingAdministrativeActivities(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const countPendingAdministrativeActivitiesSQLStatement = countPendingAdministrativeActivitiesSQL(systemUserId);

      if (!countPendingAdministrativeActivitiesSQLStatement) {
        throw new HTTP500('Failed to build SQL query statement');
      }

      const countPendingAdministrativeActivitiesResponse = await connection.query(
        countPendingAdministrativeActivitiesSQLStatement.text,
        countPendingAdministrativeActivitiesSQLStatement.values
      );

      await connection.commit();

      const countPendingAdministrativeActivitiesResult =
        (countPendingAdministrativeActivitiesResponse &&
          countPendingAdministrativeActivitiesResponse.rows &&
          countPendingAdministrativeActivitiesResponse.rows[0]) ||
        null;

      if (!countPendingAdministrativeActivitiesResult || !countPendingAdministrativeActivitiesResult.cnt) {
        throw new HTTP500('Failed to count pending administrative activities');
      }

      const hasPending = countPendingAdministrativeActivitiesResult.cnt > 0 ? true : false;

      return res.status(200).json({ hasPending: hasPending });
    } catch (error) {
      defaultLog.error({ label: 'hasPending', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
