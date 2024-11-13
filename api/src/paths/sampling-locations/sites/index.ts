import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { ISiteAdvancedFilters } from '../../../models/sampling-locations-view';
import { paginationRequestQueryParamSchema } from '../../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { SampleLocationService } from '../../../services/sample-location-service';
import { getLogger } from '../../../utils/logger';
import { ensureCompletePaginationOptions, makePaginationOptionsFromRequest } from '../../../utils/pagination';
import { getSystemUserFromRequest } from '../../../utils/request';

const defaultLog = getLogger('paths/site/index');

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

      const sampleLocationService = new SampleLocationService(connection);

      const sites = await sampleLocationService.findSites(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      const response = {
        sites: sites
        // TODO NICK add count and pagination to response and openapi schema?
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSites', message: 'error', error });
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
    system_user_id: req.query.system_user_id ?? undefined
  };
}
