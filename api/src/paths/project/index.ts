import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IProjectAdvancedFilters } from '../../models/project-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { setCacheControl } from '../../utils/api-utils';
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
  getProjects()
];

GET.apiDoc = {
  description: "Gets a list of projects based on the user's permissions and search criteria.",
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'start_date',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
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
          type: 'integer'
        },
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
      name: 'project_name',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        }
      }
    },
    ...paginationRequestQueryParamSchema
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
            itis_tsns: {
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
 * Get projects for the current user, based on their permissions and search criteria.
 *
 * @returns {RequestHandler}
 */
export function getProjects(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getProjects' });

    console.log('1=======================================');
    console.log('---params---');
    console.log(req.params);
    console.log('---query---');
    console.log(req.query);
    console.log('---body---');
    console.log(req.body);
    console.log('2=======================================');

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

      const projects = await projectService.findProjects(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      const projectsTotalCount = await projectService.findProjectCount(filterFields, isUserAdmin, systemUserId);

      await connection.commit();

      const response = {
        projects,
        pagination: makePaginationResponse(projectsTotalCount, paginationOptions)
      };

      // Allow browsers to cache this response for 30 seconds
      setCacheControl(res, 30);

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function parseQueryParams(req: Request): IProjectAdvancedFilters {
  return {
    keyword: req.params.keyword && String(req.params.keyword),
    project_name: req.params.project_name && String(req.params.project_name),
    project_programs: req.params.project_programs
      ? String(req.params.project_programs).split(',').map(Number)
      : undefined,
    itis_tsns: req.params.itis_tsns ? String(req.params.itis_tsns).split(',').map(Number) : undefined,
    start_date: req.params.start_date && String(req.params.start_date),
    end_date: req.params.end_date && String(req.params.end_date)
  };
}
