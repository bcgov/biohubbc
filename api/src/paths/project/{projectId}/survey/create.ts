import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { PostSurveyObject } from '../../../../models/survey-create';
import { GeoJSONFeature } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../services/survey-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/create');

export const POST: Operation = [
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
  createSurvey()
];

POST.apiDoc = {
  description: 'Create a new Survey.',
  tags: ['survey'],
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
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Survey post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'SurveyProject post request object',
          type: 'object',
          required: [
            'survey_details',
            'species',
            'permit',
            'funding_sources',
            'partnerships',
            'proprietor',
            'purpose_and_methodology',
            'locations',
            'site_selection',
            'agreements',
            'participants'
          ],
          properties: {
            survey_details: {
              type: 'object',
              required: ['survey_name', 'start_date'],
              properties: {
                survey_name: {
                  type: 'string'
                },
                start_date: {
                  type: 'string',
                  description: 'ISO 8601 date string'
                },
                end_date: {
                  type: 'string',
                  description: 'ISO 8601 date string',
                  nullable: true
                },
                survey_types: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    minimum: 1
                  }
                }
              }
            },
            species: {
              type: 'object',
              properties: {
                focal_species: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  description: 'Selected focal species ids'
                },
                ancillary_species: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  description: 'Selected ancillary species ids'
                }
              }
            },
            permit: {
              type: 'object',
              properties: {
                permits: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['permit_number', 'permit_type'],
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
            funding_sources: {
              type: 'array',
              items: {
                type: 'object',
                required: ['funding_source_id', 'amount'],
                properties: {
                  funding_source_id: {
                    type: 'number',
                    minimum: 1
                  },
                  amount: {
                    type: 'number'
                  }
                }
              }
            },
            partnerships: {
              title: 'Survey partnerships',
              type: 'object',
              required: [],
              properties: {
                indigenous_partnerships: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    minimum: 1
                  }
                },
                stakeholder_partnerships: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            },
            proprietor: {
              type: 'object',
              properties: {
                survey_data_proprietary: {
                  type: 'string'
                },
                proprietary_data_category: {
                  type: 'number'
                },
                proprietor_name: {
                  type: 'string'
                },
                category_rationale: {
                  type: 'string'
                },
                first_nations_id: {
                  type: 'number'
                },
                disa_required: {
                  type: 'string'
                }
              }
            },
            purpose_and_methodology: {
              type: 'object',
              properties: {
                intended_outcome_ids: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'integer'
                  }
                },
                additional_details: {
                  type: 'string'
                },
                vantage_code_ids: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
                }
              }
            },
            locations: {
              description: 'Survey location data',
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['name', 'description', 'geojson'],
                properties: {
                  name: {
                    type: 'string',
                    maxLength: 100
                  },
                  description: {
                    type: 'string',
                    maxLength: 250
                  },
                  geojson: {
                    type: 'array',
                    items: {
                      ...(GeoJSONFeature as object)
                    }
                  }
                }
              }
            },
            site_selection: {
              type: 'object',
              required: ['strategies', 'stratums'],
              properties: {
                strategies: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'string'
                  }
                },
                stratums: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name', 'description'],
                    properties: {
                      name: {
                        type: 'string'
                      },
                      description: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                required: ['system_user_id', 'survey_job_name'],
                properties: {
                  system_user_id: {
                    type: 'number',
                    minimum: 1
                  },
                  survey_job_name: {
                    type: 'string'
                  }
                }
              }
            },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: {
                    type: 'string'
                  },
                  description: {
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
  responses: {
    200: {
      description: 'Survey response object.',
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

export function createSurvey(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);

    const sanitizedPostSurveyData = new PostSurveyObject(req.body);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const surveyId = await surveyService.createSurveyAndUploadMetadataToBioHub(projectId, sanitizedPostSurveyData);

      await connection.commit();

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.error({ label: 'createSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
