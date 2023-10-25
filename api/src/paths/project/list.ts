import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IProjectAdvancedFilters } from '../../models/project-view';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';

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
                type: 'number'
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
            species: {
              type: 'array',
              items: {
                type: 'number'
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
            type: 'array',
            items: {
              title: 'Survey get response object, for view purposes',
              type: 'object',
              required: ['projectData', 'projectSupplementaryData'],
              properties: {
                projectData: {
                  type: 'object',
                  required: [
                    'id',
                    'name',
                    'project_programs',
                    'start_date',
                    'end_date',
                    'completion_status',
                    'regions'
                  ],
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    project_programs: {
                      type: 'array',
                      items: {
                        type: 'number'
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
                projectSupplementaryData: {
                  type: 'object',
                  required: ['publishStatus'],
                  properties: {
                    publishStatus: {
                      type: 'string',
                      enum: ['NO_DATA', 'UNSUBMITTED', 'SUBMITTED']
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
      $ref: '#/components/responses/401'
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

      const projects = await projectService.getProjectList(isUserAdmin, systemUserId, filterFields);

      const projectListWithStatus = await Promise.all(
        projects.map(async (project: any) => {
          const status = await projectService.projectPublishStatus(project.id);
          return {
            projectData: project,
            projectSupplementaryData: { publishStatus: status }
          };
        })
      );

      await connection.commit();

      return res.status(200).json(projectListWithStatus);
    } catch (error) {
      defaultLog.error({ label: 'getProjectList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
