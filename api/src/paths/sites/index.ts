import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ISiteAdvancedFilters } from '../../models/site-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { SampleSiteService } from '../../services/sample-site-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/sites/index');

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
  findSites()
];

GET.apiDoc = {
  description: "Gets a list of sites based on the user's permissions and filter criteria.",
  tags: ['sites'],
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
      name: 'keyword',
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
      description: 'Sites response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['sites'],
            additionalProperties: false,
            properties: {
              sites: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['survey_sample_site_id', 'survey_id', 'name', 'description', 'geometry_type'],
                  additionalProperties: false,
                  properties: {
                    survey_sample_site_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    },
                    geometry_type: {
                      type: 'string'
                    },
                    blocks: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['survey_sample_block_id', 'survey_sample_site_id', 'survey_block_id'],
                        properties: {
                          survey_sample_block_id: {
                            type: 'number'
                          },
                          survey_sample_site_id: {
                            type: 'number'
                          },
                          survey_block_id: {
                            type: 'number'
                          },
                          name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string'
                          }
                        }
                      }
                    },
                    stratums: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['survey_sample_stratum_id', 'survey_sample_site_id', 'survey_stratum_id'],
                        properties: {
                          survey_sample_stratum_id: {
                            type: 'number'
                          },
                          survey_sample_site_id: {
                            type: 'number'
                          },
                          survey_stratum_id: {
                            type: 'number'
                          },
                          name: {
                            type: 'string'
                          },
                          description: {
                            type: 'string'
                          }
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
 * Get sites for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findSites(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findSites' });

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

      const sampleSiteService = new SampleSiteService(connection);

      const [sites, sitesCount] = await Promise.all([
        sampleSiteService.findSites(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        sampleSiteService.findSitesCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        sites: sites,
        pagination: makePaginationResponse(sitesCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findSites', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, ISiteAdvancedFilters>} req
 * @return {*}  {ISiteAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, ISiteAdvancedFilters>): ISiteAdvancedFilters {
  return {
    survey_id: (req.query.survey_id && Number(req.query.survey_id)) ?? undefined,
    keyword: req.query.keyword ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
