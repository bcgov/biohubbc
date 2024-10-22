import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import {
  CreateManualTelemetry,
  UpdateManualTelemetry
} from '../../../../../../../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments2/telemetry/manual/index');

export const POST: Operation = [
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
  bulkCreateManualTelemetry()
];

POST.apiDoc = {
  description: 'Bulk create manual telemetry records.',
  tags: ['telemetry'],
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
    description: 'Manual telemetry bulk create payload.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['telemetry'],
          properties: {
            telemetry: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['deployment2_id', 'latitude', 'longitude', 'acquisition_date', 'transmission_date'],
                properties: {
                  deployment2_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  latitude: {
                    type: 'number',
                    minimum: -90,
                    maximum: 90
                  },
                  longitude: {
                    type: 'number',
                    minimum: -180,
                    maximum: 180
                  },
                  acquisition_date: {
                    type: 'string'
                  },
                  transmission_date: {
                    type: 'string',
                    nullable: true
                  }
                }
              },
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Responds successfully if the telemetry records were created.'
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
    409: {
      $ref: '#/components/responses/409'
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
 * Bulk create manual telemetry records.
 *
 * @export
 * @return {*} {RequestHandler}
 */
export function bulkCreateManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const telemetry: CreateManualTelemetry[] = req.body.telemetry;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      await telemetryVendorService.bulkCreateManualTelemetry(surveyId, telemetry);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'bulkCreateManualTelemetry', message: 'error', error });
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
  bulkUpdateManualTelemetry()
];

POST.apiDoc = {
  description: 'Bulk update manual telemetry records.',
  tags: ['telemetry'],
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
    description: 'Manual telemetry bulk create payload.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['telemetry'],
          properties: {
            telemetry: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['latitude', 'longitude', 'acquisition_date', 'transmission_date'],
                properties: {
                  telemetry_manual_id: {
                    type: 'string',
                    format: 'uuid'
                  },
                  latitude: {
                    type: 'number',
                    minimum: -90,
                    maximum: 90
                  },
                  longitude: {
                    type: 'number',
                    minimum: -180,
                    maximum: 180
                  },
                  acquisition_date: {
                    type: 'string'
                  },
                  transmission_date: {
                    type: 'string',
                    nullable: true
                  }
                }
              },
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Responds successfully if the telemetry records were updated.'
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
    409: {
      $ref: '#/components/responses/409'
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
 * Bulk update manual telemetry records.
 *
 * @export
 * @return {*} {RequestHandler}
 */
export function bulkUpdateManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const telemetry: UpdateManualTelemetry[] = req.body.telemetry;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      await telemetryVendorService.bulkUpdateManualTelemetry(surveyId, telemetry);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'bulkUpdateManualTelemetry', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
