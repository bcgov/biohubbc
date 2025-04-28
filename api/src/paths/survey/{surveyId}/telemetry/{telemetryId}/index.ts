import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/survey/{surveyId}/telemetry/{telemetryId}/index');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getTelemetryRecordInSurvey()
];

GET.apiDoc = {
  description: 'Gets a telemetry record.',
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
    {
      in: 'path',
      name: 'telemetryId',
      schema: {
        type: 'string',
        format: 'uuid'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with information about a telemetry record under this survey.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              telemetry: {
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
 * Gets a telemetry record in a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getTelemetryRecordInSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const telemetryId = req.params.telemetryId;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const telemetry = await telemetryVendorService.getTelemetryRecordById(surveyId, telemetryId);

      await connection.commit();

      return res.status(200).json({ telemetry: telemetry });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetryRecordInSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
