import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TelemetryDeviceService } from '../../../../../../services/telemetry-services/telemetry-device-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/index');

export const POST: Operation = [
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
  createDevice()
];

POST.apiDoc = {
  description: 'Create a telemetry device.',
  tags: ['telemetry', 'device'],
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
  },
  responses: {
    201: {
      description: 'Telemetry device created OK.'
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
 * Create a device.
 *
 * @returns
 */
export function createDevice(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const serial = req.body.serial;
    const device_make_id = Number(req.body.device_make_id);
    const model = req.body.model;
    const comment = req.body.comment;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryDeviceService = new TelemetryDeviceService(connection);

      await telemetryDeviceService.createDevice({
        survey_id: surveyId,
        serial: serial,
        device_make_id: device_make_id,
        model: model,
        comment: comment
      });

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'createDevice', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
  getDevices()
];

GET.apiDoc = {
  description: 'Get telemetry devices for a survey.',
  tags: ['telemetry', 'device'],
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
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of survey devices.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['devices', 'count'],
            additionalProperties: false,
            properties: {
              devices: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment'],
                  additionalProperties: false,
                  properties: {
                    device_id: {
                      type: 'number'
                    },
                    survey_id: {
                      type: 'number'
                    },
                    device_key: {
                      type: 'string'
                    },
                    serial: {
                      type: 'string'
                    },
                    device_make_id: {
                      type: 'number'
                    },
                    model: {
                      type: 'string'
                    },
                    comment: {
                      type: 'string'
                    }
                  }
                }
              },
              count: {
                type: 'number',
                description: 'Count of telemetry devices in the respective survey.'
              },
              pagination: { ...paginationResponseSchema }
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
 * Get all devices for a survey.
 *
 * @returns {RequestHandler}
 */
export function getDevices(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const telemetryDeviceService = new TelemetryDeviceService(connection);

      const [devices, devicesCount] = await Promise.all([
        telemetryDeviceService.getDevicesForSurvey(surveyId, ensureCompletePaginationOptions(paginationOptions)),
        telemetryDeviceService.getDevicesCount(surveyId)
      ]);

      await connection.commit();

      return res.status(200).json({
        devices,
        count: devicesCount,
        pagination: makePaginationResponse(devicesCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getDevices', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
