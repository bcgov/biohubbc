import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { paginationRequestQueryParamSchema } from '../../../../../openapi/schemas/pagination';
import { TelemetrySchema } from '../../../../../openapi/schemas/telemetry';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../../../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../../../../utils/logger';
const defaultLog = getLogger('paths/survey/{surveyId}/critters/{critterId}/telemetry');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
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
  getCritterTelemetry()
];

GET.apiDoc = {
  description: 'Get telemetry points for a specific critter.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'query',
      name: 'startDate',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'endDate',
      schema: {
        type: 'string'
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Responds with telemetry points for a specific critter.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['telemetry'],
            additionalProperties: false,
            properties: {
              telemetry: {
                type: 'array',
                items: TelemetrySchema
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

export function getCritterTelemetry(): RequestHandler {
  return async (req, res) => {
    const critterId = Number(req.params.critterId);
    const surveyId = Number(req.params.surveyId);
    const startDate = req.query.startDate && String(req.query.startDate);
    const endDate = req.query.endDate && String(req.query.endDate);

    const connection = getDBConnection(req.keycloak_token);
    try {
      await connection.open();

      const telemetryVendorService = new TelemetryVendorService(connection);

      const telemetry = await telemetryVendorService.getTelemetryForCritter(surveyId, critterId, {
        filters: {
          startDate,
          endDate
        }
      });

      await connection.commit();

      return res.status(200).json({ telemetry: telemetry });
    } catch (error) {
      defaultLog.error({ label: 'telemetry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
