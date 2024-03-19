import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { projectAndSystemUserSchema } from '../../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';
const defaultLog = getLogger('paths/project/{projectId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  viewProject()
];

GET.apiDoc = {
  description: 'Get a project, for view-only purposes.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project get response object, for view purposes',
            type: 'object',
            additionalProperties: false,
            required: ['projectData'],
            properties: {
              projectData: {
                type: 'object',
                additionalProperties: false,
                required: ['project', 'participants', 'objectives', 'iucn'],
                properties: {
                  project: {
                    description: 'Basic project metadata',
                    type: 'object',
                    additionalProperties: false,
                    required: ['project_id', 'uuid', 'project_name', 'project_programs', 'start_date', 'comments'],
                    properties: {
                      project_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      uuid: {
                        type: 'string',
                        format: 'uuid'
                      },
                      project_name: {
                        type: 'string'
                      },
                      project_programs: {
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      },
                      start_date: {
                        type: 'string',
                        format: 'date',
                        description: 'ISO 8601 date string for the project start date'
                      },
                      end_date: {
                        type: 'string',
                        format: 'date',
                        description: 'ISO 8601 date string for the project end date',
                        nullable: true
                      },
                      comments: {
                        type: 'string',
                        nullable: true,
                        description: 'Comments'
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
                      }
                    }
                  },
                  participants: {
                    title: 'Project participants',
                    type: 'array',
                    items: {
                      ...projectAndSystemUserSchema
                    }
                  },
                  objectives: {
                    description: 'The project objectives',
                    type: 'object',
                    additionalProperties: false,
                    required: ['objectives'],
                    properties: {
                      objectives: {
                        type: 'string'
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
                      }
                    }
                  },
                  iucn: {
                    description: 'The International Union for Conservation of Nature number',
                    type: 'object',
                    additionalProperties: false,
                    required: ['classificationDetails'],
                    properties: {
                      classificationDetails: {
                        type: 'array',
                        items: {
                          type: 'object',
                          additionalProperties: false,
                          properties: {
                            classification: {
                              type: 'number'
                            },
                            subClassification1: {
                              type: 'number'
                            },
                            subClassification2: {
                              type: 'number'
                            }
                          }
                        }
                      }
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
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
export function viewProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const projectData = await projectService.getProjectById(Number(req.params.projectId));

      await connection.commit();

      return res.status(200).json({ projectData });
    } catch (error) {
      defaultLog.error({ label: 'getProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
