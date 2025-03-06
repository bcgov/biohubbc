import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IAllTelemetryAdvancedFilters } from '../../models/telemetry-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { TelemetryVendorService } from '../../services/telemetry-services/telemetry-vendor-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/telemetry');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  findTelemetry()
];

GET.apiDoc = {
  description: "Gets a list of telemetry based on the user's permissions and filter criteria.",
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      description: 'ITIS TSN numbers',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        },
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsn',
      description: 'ITIS TSN number',
      required: false,
      schema: {
        type: 'integer',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'start_date',
      description: 'ISO 8601 date string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      },
      example: '2021-01-01'
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 date string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      },
      example: '2021-02-01'
    },
    {
      in: 'query',
      name: 'system_user_id',
      required: false,
      schema: {
        type: 'number',
        minimum: 1,
        nullable: true
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Telemetry response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['telemetry', 'pagination'],
            properties: {
              telemetry: {
                type: 'array',
                items: {
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
                      type: 'string',
                      format: 'uuid',
                      description: 'The telemetry record ID.'
                    },
                    deployment_id: {
                      type: 'number',
                      minimum: 1,
                      description: 'The deployment record ID.'
                    },
                    critter_id: {
                      type: 'number',
                      minimum: 1,
                      description: 'The SIMS critter record ID.'
                    },
                    vendor: {
                      type: 'string',
                      description: 'The telemetry device vendor.'
                    },
                    serial: {
                      type: 'string',
                      description: 'The telemetry device serial number.'
                    },
                    acquisition_date: {
                      type: 'string',
                      nullable: true,
                      description: 'The date the telemetry record was recorded by the telemetry device.'
                    },
                    latitude: {
                      type: 'number',
                      nullable: true,
                      description: 'The latitude of the telemetry record.'
                    },
                    longitude: {
                      type: 'number',
                      nullable: true,
                      description: 'The longitude of the telemetry record.'
                    },
                    elevation: {
                      type: 'number',
                      description: 'The elevation of the telemetry point.',
                      nullable: true
                    },
                    temperature: {
                      type: 'number',
                      description: 'The temperature of the telemetry point.',
                      nullable: true
                    }
                  }
                }
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
 * Get telemetry for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findTelemetry(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findTelemetry' });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const systemUser = getSystemUserFromRequest(req);

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const telemetryVendorService = new TelemetryVendorService(connection);

      const [telemetry, telemetryCount] = await Promise.all([
        telemetryVendorService.findTelemetry(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        telemetryVendorService.findTelemetryCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res
        .status(200)
        .json({ telemetry: telemetry, pagination: makePaginationResponse(telemetryCount, paginationOptions) });
    } catch (error) {
      defaultLog.error({ label: 'findTelemetry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, IAllTelemetryAdvancedFilters>} req
 * @return {*}  {IAllTelemetryAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, IAllTelemetryAdvancedFilters>
): IAllTelemetryAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
