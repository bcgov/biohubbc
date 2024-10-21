import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { TelemetryDeviceService } from '../../../../../../../services/telemetry-services/telemetry-device-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/devices/{deviceId}/index');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getDevice()
];

GET.apiDoc = {
  description: 'Get a device.',
  tags: ['device'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'deviceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Device response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['device'],
            additionalProperties: false,
            properties: {
              device: {
                type: 'object',
                required: ['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment'],
                additionalProperties: false,
                properties: {
                  device_id: {
                    type: 'integer'
                  },
                  survey_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  device_key: {
                    type: 'string'
                  },
                  serial: {
                    type: 'string'
                  },
                  device_make_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  model: {
                    type: 'string',
                    maxLength: 100
                  },
                  comment: {
                    type: 'string',
                    maxLength: 250
                  }
                }
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
 * Get a device.
 *
 * @returns {RequestHandler}
 */
export function getDevice(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deviceId = Number(req.params.deviceId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryDeviceService = new TelemetryDeviceService(connection);
      const device = await telemetryDeviceService.getDevice(surveyId, deviceId);

      await connection.commit();

      return res.status(200).json({ device: device });
    } catch (error) {
      defaultLog.error({ label: 'getDevice', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  updateDevice()
];

PUT.apiDoc = {
  description: 'Update a device',
  tags: ['device'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'deviceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['serial', 'device_make_id'],
          additionalProperties: false,
          properties: {
            serial: {
              type: 'string'
            },
            device_make_id: {
              type: 'integer',
              minimum: 1
            },
            model: {
              type: 'string',
              maxLength: 100,
              nullable: true
            },
            comment: {
              type: 'string',
              maxLength: 250,
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Device updated OK.'
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
 * Update a device.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function updateDevice(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deviceId = Number(req.params.deviceId);

    const serial = req.body.serial;
    const deviceMakeId = Number(req.body.device_make_id);
    const model = req.body.model;
    const comment = req.body.comment;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryDeviceService = new TelemetryDeviceService(connection);

      await telemetryDeviceService.updateDevice(surveyId, deviceId, {
        serial: serial,
        device_make_id: deviceMakeId,
        model: model,
        comment: comment
      });

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateDevice', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteDevice()
];

DELETE.apiDoc = {
  description: 'Deletes the device.',
  tags: ['device'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'deviceId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete device OK.'
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

export function deleteDevice(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deviceId = Number(req.params.deviceId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryDeviceService = new TelemetryDeviceService(connection);

      await telemetryDeviceService.deleteDevice(surveyId, deviceId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteDevice', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
