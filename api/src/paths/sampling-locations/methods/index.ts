import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { IMethodAdvancedFilters } from '../../../models/sampling-locations-view';
import { paginationRequestQueryParamSchema } from '../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../services/sample-location-service';
import { getLogger } from '../../../utils/logger';
import { ensureCompletePaginationOptions, makePaginationOptionsFromRequest } from '../../../utils/pagination';
import { getSystemUserFromRequest } from '../../../utils/request';

const defaultLog = getLogger('paths/method/index');

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
  findMethods()
];

GET.apiDoc = {
  description: "Gets a list of methods based on the user's permissions and filter criteria.",
  tags: ['methods'],
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
      description: 'Minimum method count (inclusive).',
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
      description: 'methods response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              methods: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'survey_sample_method_id',
                    'survey_sample_site_id',
                    'description',
                    'method_response_metric_id',
                    'technique'
                  ],
                  additionalProperties: false,
                  properties: {
                    survey_sample_method_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_sample_site_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    },
                    method_response_metric_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    technique: {
                      type: 'object',
                      required: ['method_technique_id', 'name', 'description', 'attractants'],
                      additionalProperties: false,
                      properties: {
                        method_technique_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        name: {
                          type: 'string'
                        },
                        description: {
                          type: 'string',
                          nullable: true
                        },
                        attractants: {
                          type: 'array',
                          required: ['attractant_lookup_id'],
                          additionalProperties: false,
                          items: {
                            type: 'object',
                            properties: {
                              attractant_lookup_id: {
                                type: 'integer',
                                minimum: 1
                              }
                            }
                          }
                        }
                      }
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
 * Get methods for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findMethods(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findMethods' });

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

      const methods = await sampleLocationService.findMethods(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      const response = {
        methods: methods
        // TODO NICK add count and pagination to response and openapi schema?
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getMethods', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, IMethodAdvancedFilters>} req
 * @return {*}  {IMethodAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IMethodAdvancedFilters>): IMethodAdvancedFilters {
  return {
    survey_id: (req.query.survey_id && Number(req.query.survey_id)) ?? undefined,
    sample_site_id: (req.query.sample_site_id && Number(req.query.sample_site_id)) ?? undefined,
    keyword: req.query.keyword ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
