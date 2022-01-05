import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getAPIUserDBConnection, getDBConnection, IDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/custom-error';
import {
  administrativeActivityResponseObject,
  hasPendingAdministrativeActivitiesResponseObject
} from '../openapi/schemas/administrative-activity';
import { queries } from '../queries/queries';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { getUserIdentifier } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [createAdministrativeActivity()];

export const GET: Operation = [getPendingAccessRequestsCount()];

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
export function getPendingAccessRequestsCount(): RequestHandler {
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

export const PUT: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getUpdateAdministrativeActivityHandler()
];

PUT.apiDoc = {
  description: 'Update an existing administrative activity.',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative activity request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative activity put object',
          type: 'object',
          required: ['id', 'status'],
          properties: {
            id: {
              title: 'administrative activity record ID',
              type: 'number'
            },
            status: {
              title: 'administrative activity status type code ID',
              type: 'number'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Put administrative activity OK'
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
 * Get a request handler to update an existing administrative activity.
 *
 * @returns {RequestHandler}
 */
export function getUpdateAdministrativeActivityHandler(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getUpdateAdministrativeActivityHandler',
      message: 'params',
      req_body: req.body
    });

    const administrativeActivityId = Number(req.body?.id);
    const administrativeActivityStatusTypeId = Number(req.body?.status);

    if (!administrativeActivityId) {
      throw new HTTP400('Missing required body parameter: id');
    }

    if (!administrativeActivityStatusTypeId) {
      throw new HTTP400('Missing required body parameter: status');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      await updateAdministrativeActivity(administrativeActivityId, administrativeActivityStatusTypeId, connection);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'getUpdateAdministrativeActivityHandler', message: 'error', error });
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
 * @param {number} administrativeActivityStatusTypeId
 * @param {IDBConnection} connection
 */
export const updateAdministrativeActivity = async (
  administrativeActivityId: number,
  administrativeActivityStatusTypeId: number,
  connection: IDBConnection
) => {
  const sqlStatement = queries.administrativeActivity.putAdministrativeActivitySQL(
    administrativeActivityId,
    administrativeActivityStatusTypeId
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
