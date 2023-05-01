import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ACCESS_REQUEST_ADMIN_EMAIL } from '../constants/notifications';
import { getAPIUserDBConnection, IDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/http-error';
import { queries } from '../queries/queries';
import { GCNotifyService } from '../services/gcnotify-service';
import { getUserIdentifier } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from './administrative-activities';

const defaultLog = getLogger('paths/administrative-activity-request');

const ADMIN_EMAIL = process.env.GCNOTIFY_ADMIN_EMAIL || '';
const APP_HOST = process.env.APP_HOST;
const NODE_ENV = process.env.NODE_ENV;

export const POST: Operation = [createAdministrativeActivity()];

export const GET: Operation = [getAdministrativeActivityStanding()];

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
    200: {
      description: 'Administrative activity post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Administrative Activity Response Object',
            type: 'object',
            required: ['id', 'date'],
            properties: {
              id: {
                type: 'number'
              },
              date: {
                description: 'The date this administrative activity was made',
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }]
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
    200: {
      description: 'Administrative Activity standing response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['hasPendingAccessRequest', 'belongsToOneOrMoreProjects'],
            properties: {
              hasPendingAcccessRequest: {
                type: 'boolean'
              },
              belongsToOneOrMoreProjects: {
                type: 'boolean'
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
 * Creates a new access request record.
 *
 * @returns {RequestHandler}
 */
export function createAdministrativeActivity(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP500('Failed to identify system user ID');
      }

      const postAdministrativeActivitySQLStatement = queries.administrativeActivity.postAdministrativeActivitySQL(
        systemUserId,
        req?.body
      );

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

      sendAccessRequestEmail();

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

function sendAccessRequestEmail() {
  const gcnotifyService = new GCNotifyService();
  const url = `${APP_HOST}/admin/users?authLogin=true`;
  const hrefUrl = `[click here.](${url})`;
  gcnotifyService.sendEmailGCNotification(ADMIN_EMAIL, {
    ...ACCESS_REQUEST_ADMIN_EMAIL,
    subject: `${NODE_ENV}: ${ACCESS_REQUEST_ADMIN_EMAIL.subject}`,
    body1: `${ACCESS_REQUEST_ADMIN_EMAIL.body1} ${hrefUrl}`,
    footer: `${APP_HOST}`
  });
}
/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
export function getAdministrativeActivityStanding(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const userIdentifier = getUserIdentifier(req['keycloak_token']);

      if (!userIdentifier) {
        throw new HTTP400('Missing required userIdentifier');
      }

      const sqlStatement = queries.administrativeActivity.countPendingAdministrativeActivitiesSQL(userIdentifier);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      await connection.commit();

      const result = (response && response.rowCount) || 0;

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getPendingAccessRequestsCount', message: 'error', error });

      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update an existing administrative activity.
 *
 * @param {number} administrativeActivityId
 * @param {ADMINISTRATIVE_ACTIVITY_STATUS_TYPE} administrativeActivityStatusTypeName
 * @param {IDBConnection} connection
 */
export const updateAdministrativeActivity = async (
  administrativeActivityId: number,
  administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE,
  connection: IDBConnection
) => {
  const sqlStatement = queries.administrativeActivity.putAdministrativeActivitySQL(
    administrativeActivityId,
    administrativeActivityStatusTypeName
  );

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL put statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rowCount) || null;

  if (!result) {
    throw new HTTP500('Failed to update administrative activity');
  }
};
