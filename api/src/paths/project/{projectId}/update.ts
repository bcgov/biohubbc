import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { Feature } from 'geojson';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { PostParticipantData } from '../../../models/project-create';
import { GeoJSONFeature } from '../../../openapi/schemas/geoJson';
import { projectUpdatePutRequestObject } from '../../../openapi/schemas/project';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/update');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  getProjectForUpdate()
];

export enum GET_ENTITIES {
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  iucn = 'iucn',
  participants = 'participants'
}

export const getAllEntities = (): string[] => Object.values(GET_ENTITIES);

GET.apiDoc = {
  description: 'Get a project, for update purposes.',
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'query',
      name: 'entity',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: getAllEntities()
        }
      }
    }
  ],
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project get response object, for update purposes',
            type: 'object',
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: ['project_name', 'project_programs', 'start_date', 'end_date', 'revision_count'],
                nullable: true,
                properties: {
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
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              objectives: {
                description: 'The project objectives',
                type: 'object',
                required: ['objectives'],
                nullable: true,
                properties: {
                  objectives: {
                    type: 'string'
                  }
                }
              },
              location: {
                description: 'The project location object',
                type: 'object',
                required: ['location_description', 'geometry'],
                nullable: true,
                properties: {
                  location_description: {
                    type: 'string'
                  },
                  geometry: {
                    type: 'array',
                    items: {
                      ...(GeoJSONFeature as object)
                    }
                  }
                }
              },
              iucn: {
                description: 'The International Union for Conservation of Nature number',
                type: 'object',
                required: ['classificationDetails'],
                nullable: true,
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
                    'project_role_permissions',
                    'display_name',
                    'email',
                    'agency',
                    'identity_source'
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
                    },
                    display_name: {
                      type: 'string'
                    },
                    email: {
                      type: 'string'
                    },
                    agency: {
                      type: 'string',
                      nullable: true
                    },
                    identity_source: {
                      type: 'string'
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
 * Get a project, for update purposes.
 *
 * @returns {RequestHandler}
 */
export function getProjectForUpdate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const entities: string[] = (req.query?.entity as string[]) || getAllEntities();

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      await connection.open();

      const projectService = new ProjectService(connection);

      const results = await projectService.getProjectEntitiesById(projectId, entities);
      await connection.commit();

      return res.status(200).send(results);
    } catch (error) {
      defaultLog.error({ label: 'getProjectForUpdate', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  updateProject()
];

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project put request object.',
    content: {
      'application/json': {
        schema: {
          // TODO this is currently empty, and needs updating
          ...(projectUpdatePutRequestObject as object)
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
            required: ['id'],
            properties: {
              id: {
                type: 'integer',
                minimum: 1
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

export interface IUpdateProject {
  project: any | null;
  objectives: any | null;
  location: { geometry: Feature[]; location_description: string } | null;
  iucn: any | null;
  participants: PostParticipantData[] | null;
}

/**
 * Update a project.
 *
 * @returns {RequestHandler}
 */
export function updateProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const entities: IUpdateProject = req.body;

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!entities) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const projectService = new ProjectService(connection);
      await projectService.updateProjectAndUploadMetadataToBioHub(projectId, entities);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
