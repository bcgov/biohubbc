import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
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
            coordinator_agency: {
              type: 'string',
              nullable: true
            },
            project_type: {
              type: 'string',
              nullable: true
            },
            start_date: {
              type: 'string',
              nullable: true
            },
            end_date: {
              type: 'string',
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
            agency_id: {
              anyOf: [
                {
                  type: 'number'
                },
                {
                  type: 'string',
                  maxLength: 0
                }
              ],
              nullable: true
            },
            agency_project_id: {
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
                  required: ['id', 'name', 'project_type', 'start_date', 'end_date', 'completion_status'],
                  properties: {
                    id: {
                      type: 'number'
                    },
                    name: {
                      type: 'string'
                    },
                    project_type: {
                      type: 'string'
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
                    completion_status: {
                      type: 'string'
                    }
                  }
                },
                projectSupplementaryData: {
                  type: 'object',
                  required: ['has_unpublished_content'],
                  properties: {
                    has_unpublished_content: {
                      type: 'boolean'
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
      const filterFields = req.query || {};

      const projectService = new ProjectService(connection);

      const projects = await projectService.getProjectList(isUserAdmin, systemUserId, filterFields);

      const projectListWithStatus = await Promise.all(
        projects.map(async (project: any) => {
          const status = await projectService.doesProjectHaveUnpublishedContent(project.id);

          return {
            projectData: project,
            projectSupplementaryData: { has_unpublished_content: status }
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
