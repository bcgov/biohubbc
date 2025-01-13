import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ITechniqueAdvancedFilters } from '../../models/technique-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { TechniqueService } from '../../services/technique-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';
import { getSystemUserFromRequest } from '../../utils/request';

const defaultLog = getLogger('paths/techniques/index');

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
  findTechniques()
];

GET.apiDoc = {
  description: "Gets a list of techniques based on the user's permissions and filter criteria.",
  tags: ['techniques'],
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
      name: 'sample_period_id',
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
      description: 'Techniques response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['techniques'],
            additionalProperties: false,
            properties: {
              techniques: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'method_technique_id',
                    'survey_id',
                    'name',
                    'description',
                    'distance_threshold',
                    'method_lookup_id',
                    'method_lookup_name',
                    'method_response_metric_id',
                    'method_response_metric_name'
                  ],
                  additionalProperties: false,
                  properties: {
                    method_technique_id: {
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
                    distance_threshold: {
                      type: 'number',
                      nullable: true
                    },
                    method_lookup_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    method_lookup_name: {
                      type: 'string'
                    },
                    method_response_metric_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    method_response_metric_name: {
                      type: 'string'
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
 * Get techniues for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findTechniques(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findTechniques' });

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

      const techniqueService = new TechniqueService(connection);

      const [techniques, techniquesCount] = await Promise.all([
        techniqueService.findTechniques(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        techniqueService.findTechniquesCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        techniques: techniques,
        pagination: makePaginationResponse(techniquesCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findTechniques', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, ITechniqueAdvancedFilters>} req
 * @return {*}  {ITechniqueAdvancedFilters}
 */
function parseQueryParams(
  req: Request<unknown, unknown, unknown, ITechniqueAdvancedFilters>
): ITechniqueAdvancedFilters {
  return {
    survey_id: (req.query.survey_id && Number(req.query.survey_id)) ?? undefined,
    keyword: req.query.keyword ?? undefined,
    sample_site_id: (req.query.sample_site_id && Number(req.query.sample_site_id)) ?? undefined,
    sample_period_id: (req.query.sample_period_id && Number(req.query.sample_period_id)) ?? undefined,
    system_user_id: (req.query.system_user_id && Number(req.query.system_user_id)) ?? undefined
  };
}
