import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { TelemetrySchema } from '../../../../../../../../openapi/schemas/telemetry';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments2/{deploymentId}/telemetry/index');

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
  getTelemetryForDeployment()
];

GET.apiDoc = {
  description: 'Get all telemetry for a deployment.',
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
    },
    {
      in: 'path',
      name: 'deploymentId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with all telemetry for a deployment. Includes both manual and vendor telemetry.',
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
 * Gets all telemetry for a deployment.
 *
 * @export
 * @return {*} {RequestHandler}
 */
export function getTelemetryForDeployment(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const telemetry = await telemetryVendorService.getTelemetryForDeployment(surveyId, deploymentId);

      await connection.commit();

      return res.status(200).json({ telemetry: telemetry });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetryForDeployment', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
