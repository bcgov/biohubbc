import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IProjectAdvancedFilters } from '../../models/project-view';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { paginationResponseSchema } from '../../openapi/schemas/pagination'

const defaultLog = getLogger('paths/projects');

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
  getProjectList()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on search parameters if passed in.',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project list search filter criteria object.',
    content: {
      'application/json': {
        schema: {
          properties: {
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
              nullable: true
            },
            project_programs: {
              type: 'array',
              items: {
                type: 'integer'
              },
              nullable: true
            },
            keyword: {
              type: 'string',
              nullable: true
            },
            project_name: {
              type: 'string',
              nullable: true
            },
            // TODO rename this to imply ITIS TSN filtering
            species: {
              type: 'array',
              items: {
                type: 'integer'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['projects', 'pagination'],
            properties: {
              projects: {   
                type: 'object',
                required: [
                  'project_id',
                  'name',
                  'project_programs',
                  'completion_status',
                  'start_date',
                  'end_date',
                  'regions'
                ],
                properties: {
                  project_id: {
                    type: 'integer'
                  },
                  name: {
                    type: 'string'
                  },
                  project_programs: {
                    type: 'array',
                    items: {
                      type: 'integer'
                    }
                  },
                  start_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the funding end_date'
                  },
                  end_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    nullable: true,
                    description: 'ISO 8601 date string for the funding end_date'
                  },
                  regions: {
                    type: 'array',
                    items: {
                      type: 'string'
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
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getProjectList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getProjectList' });

    const page: number | undefined = req.query.page ? Number(req.query.page) : undefined;
    const limit: number | undefined = req.query.limit ? Number(req.query.limit) : undefined;
    const order: 'asc' | 'desc' | undefined = req.query.order ? (String(req.query.order) as 'asc' | 'desc') : undefined;

    const sort: string | undefined = req.query.sort ? String(req.query.sort) : undefined;

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      const filterFields: IProjectAdvancedFilters = req.query || {};

      const projectService = new ProjectService(connection);

      const paginationOptions: ApiPaginationOptions | undefined =
        limit !== undefined && page !== undefined ? { limit, page, sort, order } : undefined;

      const projects = await projectService.getProjectList(isUserAdmin, systemUserId, filterFields, paginationOptions);
      const projectsTotalCount = await projectService.getProjectCount(isUserAdmin, systemUserId);

      const response = {
        projects,
        pagination: {
          total: projectsTotalCount,
          per_page: limit,
          current_page: page ?? 1,
          last_page: limit ? Math.max(1, Math.ceil(projectsTotalCount / limit)) : 1,
          sort,
          order
        }
      };

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getProjectList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
