import { RequestHandler } from 'express';
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
  parameters: [...paginationRequestQueryParamSchema],
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
            itis_tsns: {
              type: 'array',
              items: {
                type: 'integer'
              }
            },
            system_user_id: {
              type: 'integer'
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
                      nullable: true,
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
                        type: 'string',
                        nullable: true
                      }
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        nullable: true
                      }
                    },
                    types: {
                      type: 'array',
                      items: {
                        type: 'integer',
                        nullable: true
                      }
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
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getProjectList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getProjectList' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      const filterFields: IProjectAdvancedFilters = {
        keyword: req.query.keyword && String(req.query.keyword),
        project_name: req.query.project_name && String(req.query.project_name),
        project_programs: req.query.project_programs
          ? String(req.query.project_programs).split(',').map(Number)
          : undefined,
        itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined,
        start_date: req.query.start_date && String(req.query.start_date),
        end_date: req.query.end_date && String(req.query.end_date),
        system_user_id: req.query.system_user_id && String(req.query.system_user_id)
      };

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const projectService = new ProjectService(connection);
      const projects = await projectService.getProjectList(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const projectsTotalCount = await projectService.getProjectCount(filterFields, isUserAdmin, systemUserId);

      const response = {
        projects,
        pagination: makePaginationResponse(projectsTotalCount, paginationOptions)
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
