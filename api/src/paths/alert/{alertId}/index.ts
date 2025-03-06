import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { systemAlertGetSchema, systemAlertPutSchema } from '../../../openapi/schemas/alert';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { AlertService } from '../../../services/alert-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/alert/{alertId}/index');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getAlertById()
];

GET.apiDoc = {
  description: 'Gets a specific system alert.',
  tags: ['alerts'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      required: true,
      name: 'alertId',
      schema: {
        type: 'string',
        description: 'Id of an alert to get'
      }
    }
  ],
  responses: {
    200: {
      description: 'System alert response object',
      content: {
        'application/json': {
          schema: systemAlertGetSchema
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
 * Get a specific system alert by its id
 *
 * @returns {RequestHandler}
 */
export function getAlertById(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getAlertById' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const alertId = Number(req.params.alertId);

      const alertService = new AlertService(connection);

      const alert = await alertService.getAlertById(alertId);

      await connection.commit();

      return res.status(200).json(alert);
    } catch (error) {
      defaultLog.error({ label: 'getAlertById', message: 'error', error });
      await connection.rollback();
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
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateAlert()
];

PUT.apiDoc = {
  description: 'Update an alert by its id.',
  tags: ['alerts'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      required: true,
      name: 'alertId',
      schema: {
        type: 'string',
        description: 'Id of an alert to update'
      }
    }
  ],
  requestBody: {
    description: 'Alert put request object.',
    required: true,
    content: {
      'application/json': {
        schema: systemAlertPutSchema
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
 * Updates a system alert by its id
 *
 * @returns {RequestHandler}
 */
export function updateAlert(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'updateAlert' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const alertId = Number(req.params.alertId);
      const alert = req.body;

      const alertService = new AlertService(connection);

      const id = await alertService.updateAlert({ ...alert, alert_id: alertId });

      await connection.commit();

      return res.status(200).json({ alert_id: id });
    } catch (error) {
      defaultLog.error({ label: 'updateAlert', message: 'error', error });
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
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
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
      in: 'path',
      required: true,
      name: 'alertId',
      schema: {
        type: 'string',
        description: 'Id of an alert to delete'
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
