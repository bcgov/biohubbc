import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IProjectAdvancedFilters } from '../../models/project-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/project/index');

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
  findProjects()
];

GET.apiDoc = {
  description: "Gets a list of projects based on the user's permissions and filter criteria.",
  tags: ['projects'],
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
      name: 'project_name',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'project_programs',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
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
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['projects', 'pagination'],
            properties: {
              projects: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'project_id',
                    'name',
                    'project_programs',
                    'completion_status',
                    'start_date',
                    'end_date',
                    'focal_species',
                    'regions'
                  ],
                  properties: {
                    project_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    name: {
                      type: 'string',
                      description: 'Name of the project'
                    },
                    start_date: {
                      type: 'string',
                      description: 'ISO 8601 datetime string',
                      nullable: true
                    },
                    end_date: {
                      type: 'string',
                      description: 'ISO 8601 datetime string',
                      nullable: true
                    },
                    regions: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      nullable: true
                    },
                    project_programs: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      }
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      },
                      nullable: true
                    },
                    types: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      },
                      nullable: true
                    },
                    completion_status: {
                      type: 'string',
                      enum: ['Completed', 'Active']
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
 * Get projects for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findProjects(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findProjects' });

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

      const projectService = new ProjectService(connection);

      const [projects, projectsTotalCount] = await Promise.all([
        projectService.findProjects(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        projectService.findProjectsCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      const response = {
        projects,
        pagination: makePaginationResponse(projectsTotalCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'findProjects', message: 'error', error });
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
 * @param {Request<unknown, unknown, unknown, IProjectAdvancedFilters>} req
 * @return {*}  {IProjectAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IProjectAdvancedFilters>): IProjectAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    project_name: req.query.project_name ?? undefined,
    project_programs: req.query.project_programs ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}