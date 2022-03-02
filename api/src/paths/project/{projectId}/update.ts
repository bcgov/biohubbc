import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { projectIdResponseObject, projectUpdatePutRequestObject } from '../../../openapi/schemas/project';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { ProjectService } from '../../../services/project-service';

const defaultLog = getLogger('paths/project/{projectId}/update');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getProjectForUpdate()
];

export enum GET_ENTITIES {
  coordinator = 'coordinator',
  permit = 'permit',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  iucn = 'iucn',
  funding = 'funding',
  partnerships = 'partnerships'
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
            required: ['project', 'permit', 'coordinator', 'objectives', 'location', 'iucn', 'funding', 'partnerships'],
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: [
                  'project_name',
                  'project_type',
                  'project_activities',
                  'start_date',
                  'end_date',
                  'publish_date',
                  'revision_count'
                ],
                properties: {
                  project_name: {
                    type: 'string'
                  },
                  project_type: {
                    type: 'number'
                  },
                  project_activities: {
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
                    description: 'ISO 8601 date string for the project end date'
                  },
                  publish_date: {
                    description: 'Status of the project being published/unpublished',
                    format: 'date',
                    type: 'string'
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              permit: {
                type: 'object',
                required: ['permits'],
                properties: {
                  permits: {
                    type: 'array',
                    items: {
                      title: 'Project permit',
                      type: 'object',
                      properties: {
                        permit_number: {
                          type: 'string'
                        },
                        permit_type: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              },
              coordinator: {
                title: 'Project coordinator',
                type: 'object',
                required: [
                  'first_name',
                  'last_name',
                  'email_address',
                  'coordinator_agency',
                  'share_contact_details',
                  'revision_count'
                ],
                properties: {
                  first_name: {
                    type: 'string'
                  },
                  last_name: {
                    type: 'string'
                  },
                  email_address: {
                    type: 'string'
                  },
                  coordinator_agency: {
                    type: 'string'
                  },
                  share_contact_details: {
                    type: 'string',
                    enum: ['true', 'false']
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              objectives: {
                description: 'The project objectives and caveats',
                type: 'object',
                required: ['objectives', 'caveats'],
                properties: {
                  objectives: {
                    type: 'string'
                  },
                  caveats: {
                    type: 'string'
                  }
                }
              },
              location: {
                description: 'The project location object',
                type: 'object',
                required: ['location_description', 'geometry'],
                properties: {
                  location_description: {
                    type: 'string'
                  },
                  geometry: {
                    type: 'array',
                    items: {
                      ...(geoJsonFeature as object)
                    }
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
                          type: 'string'
                        },
                        subClassification1: {
                          type: 'string'
                        },
                        subClassification2: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              },
              funding: {
                description: 'The project funding details',
                type: 'object',
                required: ['fundingSources'],
                properties: {
                  fundingSources: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'number'
                        },
                        agency_id: {
                          type: 'number'
                        },
                        investment_action_category: {
                          type: 'number'
                        },
                        investment_action_category_name: {
                          type: 'string'
                        },
                        agency_name: {
                          type: 'string'
                        },
                        funding_amount: {
                          type: 'number'
                        },
                        start_date: {
                          type: 'string',
                          format: 'date',
                          description: 'ISO 8601 date string for the funding start date'
                        },
                        end_date: {
                          type: 'string',
                          format: 'date',
                          description: 'ISO 8601 date string for the funding end_date'
                        },
                        agency_project_id: {
                          type: 'string'
                        },
                        revision_count: {
                          type: 'number'
                        }
                      }
                    }
                  }
                }
              },
              partnerships: {
                description: 'The project partners',
                type: 'object',
                required: ['indigenous_partnerships', 'stakeholder_partnerships'],
                properties: {
                  indigenous_partnerships: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  stakeholder_partnerships: {
                    type: 'array',
                    items: {
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
function getProjectForUpdate(): RequestHandler {
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
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
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
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            // TODO is there any return value? or is it just an HTTP status with no content?
            ...(projectIdResponseObject as object)
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
  coordinator: object | null;
  permit: object | null;
  project: object | null;
  objectives: object | null;
  location: object | null;
  iucn: object | null;
  funding: object | null;
  partnerships: object | null;
}

/**
 * Update a project.
 *
 * @returns {RequestHandler}
 */
function updateProject(): RequestHandler {
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

      await projectService.updateProject(projectId, entities);

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
