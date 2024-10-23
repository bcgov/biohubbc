import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments2/telemetry/manual/delete');

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
  bulkDeleteManualTelemetry()
];

POST.apiDoc = {
  description: 'Bulk delete manual telemetry records.',
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
    description: 'Manual telemetry bulk delete payload.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['telemetry_manual_ids'],
          properties: {
            telemetry_manual_ids: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid'
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
      description: 'Responds successfully if the telemetry records were deleted.'
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
 * Bulk delete manual telemetry records.
 *
 * @export
 * @return {*} {RequestHandler}
 */
export function bulkDeleteManualTelemetry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const telemetryManualIds: string[] = req.body.telemetry_manual_ids;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      await telemetryVendorService.bulkDeleteManualTelemetry(surveyId, telemetryManualIds);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'bulkDeleteManualTelemetry', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
