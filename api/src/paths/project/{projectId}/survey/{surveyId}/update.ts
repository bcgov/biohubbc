import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { PutSurveyObject } from '../../../../../models/survey-update';
import { GeoJSONFeature } from '../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update');

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
  updateSurvey()
];

PUT.apiDoc = {
  description: 'Update a survey.',
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
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Survey put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'SurveyProject put request object',
          type: 'object',
          properties: {
            survey_details: {
              type: 'object',
              required: [
                'survey_name',
                'start_date',
                'end_date',
                'biologist_first_name',
                'biologist_last_name',
                'survey_types',
                'revision_count'
              ],
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
                biologist_first_name: {
                  type: 'string'
                },
                biologist_last_name: {
                  type: 'string'
                },
                survey_types: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    minimum: 1
                  }
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            species: {
              type: 'object',
              required: ['focal_species', 'ancillary_species'],
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
                      permit_id: {
                        type: 'number',
                        nullable: true
                      },
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
                  survey_funding_source_id: {
                    type: 'number',
                    minimum: 1,
                    nullable: true
                  },
                  funding_source_id: {
                    type: 'number',
                    minimum: 1
                  },
                  amount: {
                    type: 'number'
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              }
            },
            proprietor: {
              type: 'object',
              required: [
                'survey_data_proprietary',
                'proprietary_data_category',
                'proprietor_name',
                'category_rationale',
                'disa_required'
              ],
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
                disa_required: {
                  type: 'string'
                }
              }
            },
            purpose_and_methodology: {
              type: 'object',
              required: [
                'intended_outcome_id',
                'additional_details',
                'field_method_id',
                'vantage_code_ids',
                'ecological_season_id',
                'revision_count'
              ],
              properties: {
                intended_outcome_id: {
                  type: 'number'
                },
                additional_details: {
                  type: 'string'
                },
                field_method_id: {
                  type: 'number'
                },
                vantage_code_ids: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
                },
                ecological_season_id: {
                  type: 'number'
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            location: {
              type: 'object',
              required: ['survey_area_name', 'geometry'],
              properties: {
                survey_area_name: {
                  type: 'string'
                },
                geometry: {
                  type: 'array',
                  items: {
                    ...(GeoJSONFeature as object)
                  }
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                nullable: true,
                required: ['system_user_id', 'survey_job_name'],
                properties: {
                  survey_participation_id: {
                    type: 'number',
                    minimum: 1,
                    nullable: true
                  },
                  system_user_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  survey_job_name: {
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
      description: 'Survey with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number'
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

export function updateSurvey(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const surveyId = Number(req.params.surveyId);

    const sanitizedPutSurveyData = new PutSurveyObject(req.body);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      await surveyService.updateSurveyAndUploadMetadataToBiohub(projectId, surveyId, sanitizedPutSurveyData);

      await connection.commit();

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.error({ label: 'updateSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
