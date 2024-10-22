import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { TelemetrySchema } from '../../../../../../../openapi/schemas/telemetry';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments2/telemetry/index');

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
  getTelemetryForDeployments()
];

GET.apiDoc = {
  description: 'Get all telemetry for a list of deployments.',
  tags: ['deployment'],
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
    description: 'Array of one or more deployment IDs to retrieve telemetry for.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['deployment_ids'],
          properties: {
            deployment_ids: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 1
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
      description: 'Responds with all telemetry for deployments. Includes both manual and vendor telemetry.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              telemetry: {
                type: 'array',
                items: {
                  properties: {
                    schema: TelemetrySchema
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
 * Gets all telemetry for a list of deployments.
 *
 * @export
 * @return {*} {RequestHandler}
 */
export function getTelemetryForDeployments(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentIds = req.body.deployment_ids;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const telemetry = await telemetryVendorService.getTelemetryForDeployments(surveyId, deploymentIds);

      await connection.commit();

      return res.status(200).json({ telemetry: telemetry });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetryForDeployments', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
