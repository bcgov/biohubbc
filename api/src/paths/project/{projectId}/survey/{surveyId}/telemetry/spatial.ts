import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { GeoJSONPoint } from '../../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation');

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
  getTelemetrySpatialData()
];

GET.apiDoc = {
  description: 'Get all telemetry spatial data for a survey.',
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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey telemetry spatial data.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['telemetry', 'supplementaryData'],
            additionalProperties: false,
            properties: {
              telemetry: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['telemetry_id', 'geometry'],
                  additionalProperties: false,
                  properties: {
                    telemetry_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    geometry: {
                      ...GeoJSONPoint,
                      nullable: true
                    }
                  }
                }
              },
              supplementaryData: {
                type: 'object',
                required: ['count'],
                additionalProperties: false,
                properties: {
                  count: {
                    type: 'integer',
                    minimum: 0
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
 * Fetch all telemetry spatial data for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getTelemetrySpatialData(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getTelemetrySpatialData', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const [telemetry, telemetryCount] = await telemetryVendorService.getTelemetrySpatialForSurvey(surveyId);

      await connection.commit();

      return res.status(200).json({
        telemetry: telemetry,
        supplementaryData: {
          count: telemetryCount
        }
      });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetrySpatialData', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
