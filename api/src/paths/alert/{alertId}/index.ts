import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { systemAlertSchema } from '../../../openapi/schemas/alert';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { AlertService } from '../../../services/alert-service';
import { getLogger } from '../../../utils/logger';

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
      in: 'path',
      name: 'alertId',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'System alert response object',
      content: {
        'application/json': {
          schema: systemAlertSchema
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

      const alertId = Number(req.params.alertId);

      const alertService = new AlertService(connection);

      const alert = await alertService.getAlertById(alertId);

      await connection.commit();

      return res.status(200).json(alert);
    } catch (error) {
      defaultLog.error({ label: 'getAlerts', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
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
  deleteAlert()
];

DELETE.apiDoc = {
  description: 'Delete an alert by its id.',
  tags: ['alerts'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'alertId',
      schema: {
        type: 'string'
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
 * Deletes a system alert by its id
 *
 * @returns {RequestHandler}
 */
export function deleteAlert(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'deleteAlert' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const alertId = Number(req.params.alertId);

      const alertService = new AlertService(connection);

      const id = await alertService.deleteAlert(alertId);

      await connection.commit();

      return res.status(200).json({ alert_id: id });
    } catch (error) {
      defaultLog.error({ label: 'deleteAlert', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
