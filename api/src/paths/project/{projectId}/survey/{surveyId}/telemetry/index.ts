import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  paginationRequestQueryParamSchema,
  paginationResponseSchema
} from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../../../utils/pagination';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/telemetry/index');

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
  getTelemetryInSurvey()
];

GET.apiDoc = {
  description: 'Gets all telemetry records in a survey.',
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
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Responds with information about all telemetry records under this survey.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              telemetry: {
                title: 'Telemetry Records',
                type: 'array',
                items: {
                  title: 'Telemetry Record',
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'telemetry_id',
                    'deployment_id',
                    'critter_id',
                    'vendor',
                    'serial',
                    'acquisition_date',
                    'latitude',
                    'longitude',
                    'elevation',
                    'temperature'
                  ],
                  properties: {
                    telemetry_id: {
                      type: 'string'
                    },
                    deployment_id: {
                      type: 'number'
                    },
                    critter_id: {
                      type: 'number'
                    },
                    vendor: {
                      type: 'string',
                      enum: ['vectronic', 'lotek', 'ats', 'manual']
                    },
                    serial: {
                      type: 'string'
                    },
                    acquisition_date: {
                      type: 'string'
                    },
                    latitude: {
                      type: 'number',
                      nullable: true
                    },
                    longitude: {
                      type: 'number',
                      nullable: true
                    },
                    elevation: {
                      type: 'number',
                      nullable: true
                    },
                    temperature: {
                      type: 'number',
                      nullable: true
                    }
                  }
                }
              },
              count: {
                type: 'number',
                description: 'Count of telemetry records in the respective survey.'
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
 * Gets all telemetry records in a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getTelemetryInSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      const paginationOptions = makePaginationOptionsFromRequest(req);

      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const [telemetry, telemetryCount] = await telemetryVendorService.getTelemetryForSurvey(
        surveyId,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      return res.status(200).json({
        telemetry: telemetry,
        count: telemetryCount,
        pagination: makePaginationResponse(telemetryCount, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetryInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
