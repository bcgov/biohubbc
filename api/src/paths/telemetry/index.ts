import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ITelemetryAdvancedFilters } from '../../models/telemetry-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { TelemetryService } from '../../services/telemetry-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

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
  description: "Gets a list of telemetry based on the user's permissions and search criteria.",
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
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
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
                  properties: {
                    telemetry_id: {
                      type: 'number',
                      description: 'The BCTW telemetry record ID.'
                    },
                    acquisition_date: {
                      type: 'string',
                      nullable: true,
                      description: 'The BCTW telemetry record acquisition date.'
                    },
                    latitude: {
                      type: 'number',
                      nullable: true,
                      description: 'The BCTW telemetry record latitude.'
                    },
                    longitude: {
                      type: 'number',
                      nullable: true,
                      description: 'The BCTW telemetry record longitude.'
                    },
                    telemetry_type: {
                      type: 'string',
                      description: 'The BCTW telemetry type.'
                    },
                    device_id: {
                      type: 'number',
                      description: 'The BCTW device ID.'
                    },
                    bctw_deployment_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'The BCTW deployment ID.'
                    },
                    critter_id: {
                      type: 'number',
                      minimum: 1,
                      description: 'The SIMS critter record ID.'
                    },
                    deployment_id: {
                      type: 'number',
                      minimum: 1,
                      description: 'The SIMS deployment record ID.'
                    },
                    critterbase_critter_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'The Critterbase critter ID.'
                    },
                    animal_id: {
                      type: 'string',
                      nullable: true,
                      description: 'The Critterbase animal ID.'
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
 * Get telemetry for the current user, based on their permissions and search criteria.
 *
 * @returns {RequestHandler}
 */
export function findTelemetry(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findTelemetry' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const telemetryService = new TelemetryService(connection);

      const telemetry = await telemetryService.findTelemetry(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res
        .status(200)
        .json({ telemetry: telemetry, pagination: makePaginationResponse(telemetry.length, paginationOptions) });
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
 * @param {Request<unknown, unknown, unknown, ITelemetryAdvancedFilters>} req
 * @return {*}  {ITelemetryAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, ITelemetryAdvancedFilters>
): ITelemetryAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
