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
import { getSystemUserFromRequest } from '../../utils/request';

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
      name: 'project_name',
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
                  required: ['project_id', 'name', 'start_date', 'end_date', 'focal_species', 'regions', 'types'],
                  properties: {
                    project_id: {
                      type: 'integer',
                      minimum: 1,
                      description: 'The primary id for the project'
                    },
                    name: {
                      type: 'string',
                      description: 'The name of the project'
                    },
                    start_date: {
                      type: 'string',
                      description: 'The earliest start date of the surveys in the project. ISO 8601 date string.',
                      nullable: true
                    },
                    end_date: {
                      type: 'string',
                      description: 'The latest end date of the surveys in the project. ISO 8601 date string.',
                      nullable: true
                    },
                    regions: {
                      type: 'array',
                      description: 'The regions of the surveys in the project',
                      items: {
                        type: 'string'
                      }
                    },
                    focal_species: {
                      type: 'array',
                      description: 'The focal species of the surveys in the project',
                      items: {
                        type: 'integer'
                      }
                    },
                    types: {
                      type: 'array',
                      description: 'The types of the surveys in the project',
                      items: {
                        type: 'integer'
                      }
                    },
                    members: {
                      type: 'array',
                      description: 'Display name of project participants',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                          system_user_id: { type: 'number' },
                          display_name: { type: 'string' }
                        }
                      }
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
    project_name: req.query.project_name ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
