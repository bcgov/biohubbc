import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { IPeriodAdvancedFilters } from '../../../models/sampling-locations-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../services/sample-location-service';
import { getLogger } from '../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../utils/pagination';
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
      name: 'survey_id',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'sample_site_id',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'sample_method_id',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
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
            required: ['periods', 'pagination'],
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
                    'end_time',
                    'sample_method',
                    'method_technique',
                    'sample_site'
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
                    },
                    sample_method: {
                      type: 'object',
                      required: ['method_response_metric_id'],
                      additionalProperties: false,
                      properties: {
                        method_response_metric_id: {
                          type: 'integer',
                          minimum: 1
                        }
                      }
                    },
                    method_technique: {
                      type: 'object',
                      required: ['method_technique_id', 'name'],
                      additionalProperties: false,
                      properties: {
                        method_technique_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        name: {
                          type: 'string'
                        }
                      }
                    },
                    sample_site: {
                      type: 'object',
                      required: ['survey_sample_site_id', 'name'],
                      additionalProperties: false,
                      properties: {
                        survey_sample_site_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        name: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              },
              pagination: paginationResponseSchema
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

      const [periods, periodsCount] = await Promise.all([
        sampleLocationService.findPeriods(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        sampleLocationService.findPeriodsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        periods: periods,
        pagination: makePaginationResponse(periodsCount, paginationOptions)
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
