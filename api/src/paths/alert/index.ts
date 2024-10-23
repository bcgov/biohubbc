import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IAlertFilterObject } from '../../models/alert-view';
import { systemAlertCreateSchema, systemAlertSchema } from '../../openapi/schemas/alert';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AlertService } from '../../services/alert-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/alert/index');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getAlerts()
];

GET.apiDoc = {
  description: 'Gets a list of system alerts.',
  tags: ['alerts'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'types',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'string',
          nullable: true
        }
      }
    },
    {
      in: 'query',
      name: 'expiresBefore',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'expiresAfter',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    }
  ],
  responses: {
    200: {
      description: 'System alert response object',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            description: 'Response object containing system alerts',
            additionalProperties: false,
            required: ['alerts'],
            properties: { alerts: { type: 'array', description: 'Array of system alerts', items: systemAlertSchema } }
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
 * Get system alerts created by system administrators describing important information, deadlines, etc.
 *
 * @returns {RequestHandler}
 */
export function getAlerts(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getAlerts' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const filterObject = parseQueryParams(req);

      const alertService = new AlertService(connection);

      const alerts = await alertService.getAlerts(filterObject);

      await connection.commit();

      return res.status(200).json({ alerts: alerts });
    } catch (error) {
      defaultLog.error({ label: 'getAlerts', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, IAlertFilterObject>} req
 * @return {*}  {IAlertFilterObject}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IAlertFilterObject>): IAlertFilterObject {
  return {
    expiresBefore: req.query.expiresBefore ?? undefined,
    expiresAfter: req.query.expiresAfter ?? undefined,
    types: req.query.types ?? []
  };
}

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser',
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]
        }
      ]
    };
  }),
  createAlert()
];

POST.apiDoc = {
  description: 'Create an alert.',
  tags: ['alerts'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Alert post request object.',
    content: {
      'application/json': {
        schema: systemAlertCreateSchema
      }
    }
  },
  responses: {
    200: {
      description: 'System alert response object',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['alert_id'],
            properties: {
              alert_id: {
                type: 'number'
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
 * Creates a new system alert
 *
 * @returns {RequestHandler}
 */
export function createAlert(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'createAlert' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const alert = req.body;

      const alertService = new AlertService(connection);

      const id = await alertService.createAlert(alert);

      await connection.commit();

      return res.status(200).json({ alert_id: id });
    } catch (error) {
      defaultLog.error({ label: 'createAlert', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
