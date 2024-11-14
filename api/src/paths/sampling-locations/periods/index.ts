import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { IPeriodAdvancedFilters } from '../../../models/sampling-locations-view';
import { paginationRequestQueryParamSchema } from '../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../services/sample-location-service';
import { getLogger } from '../../../utils/logger';
import { ensureCompletePaginationOptions, makePaginationOptionsFromRequest } from '../../../utils/pagination';
import { getSystemUserFromRequest } from '../../../utils/request';

const defaultLog = getLogger('paths/period/index');

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
  findPeriods()
];

GET.apiDoc = {
  description: "Gets a list of periods based on the user's permissions and filter criteria.",
  tags: ['periods'],
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
      }
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 date string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'start_time',
      description: 'ISO 8601 time string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_time',
      description: 'ISO 8601 time string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'min_count',
      description: 'Minimum period count (inclusive).',
      required: false,
      schema: {
        type: 'number',
        minimum: 0,
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
      description: 'periods response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['periods'],
            additionalProperties: false,
            properties: {
              periods: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'survey_sample_period_id',
                    'survey_sample_method_id',
                    'start_date',
                    'start_time',
                    'end_date',
                    'end_time'
                  ],
                  additionalProperties: false,
                  properties: {
                    survey_sample_period_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_sample_method_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    start_date: {
                      type: 'string'
                    },
                    start_time: {
                      type: 'string',
                      nullable: true
                    },
                    end_date: {
                      type: 'string'
                    },
                    end_time: {
                      type: 'string',
                      nullable: true
                    }
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
 * Get periods for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findPeriods(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findPeriods' });

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

      const sampleLocationService = new SampleLocationService(connection);

      const periods = await sampleLocationService.findPeriods(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      const response = {
        periods: periods
        // TODO NICK add count and pagination to response and openapi schema?
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getPeriods', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, IPeriodAdvancedFilters>} req
 * @return {*}  {IPeriodAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IPeriodAdvancedFilters>): IPeriodAdvancedFilters {
  return {
    survey_id: (req.query.survey_id && Number(req.query.survey_id)) ?? undefined,
    sample_site_id: (req.query.sample_site_id && Number(req.query.sample_site_id)) ?? undefined,
    sample_method_id: (req.query.sample_method_id && Number(req.query.sample_method_id)) ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
