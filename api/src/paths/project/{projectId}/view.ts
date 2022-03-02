import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getProjectForView()
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
        type: 'number'
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
            required: [
              'id',
              'project',
              'permit',
              'coordinator',
              'objectives',
              'location',
              'iucn',
              'funding',
              'partnerships'
            ],
            properties: {
              id: {
                description: 'Project id',
                type: 'number'
              },
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: [
                  'project_name',
                  'project_type',
                  'project_activities',
                  'start_date',
                  'end_date',
                  'comments',
                  'completion_status',
                  'publish_date'
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
                  comments: {
                    type: 'string',
                    description: 'Comments'
                  },
                  completion_status: {
                    description: 'Status of the project being active/completed',
                    type: 'string'
                  },
                  publish_date: {
                    description: 'Status of the project being published/unpublished',
                    format: 'date',
                    type: 'string'
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
                required: ['first_name', 'last_name', 'email_address', 'coordinator_agency', 'share_contact_details'],
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
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
export function getProjectForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectById(Number(req.params.projectId));

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
