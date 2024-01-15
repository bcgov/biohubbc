import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
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
            required: ['projectData', 'projectSupplementaryData'],
            properties: {
              projectData: {
                type: 'object',
                required: ['project', 'participants', 'objectives', 'iucn'],
                properties: {
                  project: {
                    description: 'Basic project metadata',
                    type: 'object',
                    required: ['project_id', 'project_name', 'project_programs', 'start_date', 'comments'],
                    properties: {
                      project_id: {
                        type: 'integer',
                        minimum: 1
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
                      }
                    }
                  },
                  participants: {
                    title: 'Project participants',
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'project_participation_id',
                        'project_id',
                        'system_user_id',
                        'project_role_ids',
                        'project_role_names',
                        'project_role_permissions'
                      ],
                      properties: {
                        project_participation_id: {
                          type: 'number'
                        },
                        project_id: {
                          type: 'number'
                        },
                        system_user_id: {
                          type: 'number'
                        },
                        project_role_ids: {
                          type: 'array',
                          items: {
                            type: 'number'
                          }
                        },
                        project_role_names: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        },
                        project_role_permissions: {
                          type: 'array',
                          items: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  },
                  objectives: {
                    description: 'The project objectives',
                    type: 'object',
                    required: ['objectives'],
                    properties: {
                      objectives: {
                        type: 'string'
                      }
                    }
                  },
                  iucn: {
                    description: 'The International Union for Conservation of Nature number',
                    type: 'object',
                    required: ['classificationDetails'],
                    properties: {
                      classificationDetails: {
                        type: 'array',
                        items: {
                          type: 'object',
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
              },
              projectSupplementaryData: {
                description: 'Project supplementary data',
                type: 'object',
                required: ['project_metadata_publish'],
                properties: {
                  project_metadata_publish: {
                    description: 'Project metadata publish record',
                    type: 'object',
                    nullable: true,
                    required: [
                      'project_metadata_publish_id',
                      'project_id',
                      'event_timestamp',
                      'submission_uuid',
                      'create_date',
                      'create_user',
                      'update_date',
                      'update_user',
                      'revision_count'
                    ],
                    properties: {
                      project_metadata_publish_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      project_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      event_timestamp: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date'
                      },
                      submission_uuid: {
                        type: 'string'
                      },
                      create_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date'
                      },
                      create_user: {
                        type: 'integer',
                        minimum: 1
                      },
                      update_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date',
                        nullable: true
                      },
                      update_user: {
                        type: 'integer',
                        minimum: 1,
                        nullable: true
                      },
                      revision_count: {
                        type: 'integer',
                        minimum: 0
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

      const projectSupplementaryData = await projectService.getProjectSupplementaryDataById(
        Number(req.params.projectId)
      );

      await connection.commit();

      return res.status(200).json({ projectData: projectData, projectSupplementaryData: projectSupplementaryData });
    } catch (error) {
      defaultLog.error({ label: 'getProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
