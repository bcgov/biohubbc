import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { GeoJSONFeature } from '../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

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
  getSurvey()
];

GET.apiDoc = {
  description: 'Get a project survey, for view-only purposes.',
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
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey with matching surveyId and projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey get response object, for view purposes',
            type: 'object',
            required: ['surveyData', 'surveySupplementaryData'],
            properties: {
              surveyData: {
                type: 'object',
                required: [
                  'survey_details',
                  'species',
                  'permit',
                  'funding_sources',
                  'partnerships',
                  'proprietor',
                  'purpose_and_methodology',
                  'location'
                ],
                properties: {
                  survey_details: {
                    description: 'Survey Details',
                    type: 'object',
                    required: [
                      'survey_name',
                      'start_date',
                      'biologist_first_name',
                      'biologist_last_name',
                      'revision_count'
                    ],
                    properties: {
                      survey_name: {
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
                      biologist_first_name: {
                        type: 'string'
                      },
                      biologist_last_name: {
                        type: 'string'
                      },
                      revision_count: {
                        type: 'number'
                      }
                    }
                  },
                  species: {
                    description: 'Survey Species',
                    type: 'object',
                    required: ['focal_species', 'focal_species_names', 'ancillary_species', 'ancillary_species_names'],
                    properties: {
                      ancillary_species: {
                        nullable: true,
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      },
                      ancillary_species_names: {
                        nullable: true,
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      },
                      focal_species: {
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      },
                      focal_species_names: {
                        type: 'array',
                        items: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  permit: {
                    description: 'Survey Permit',
                    type: 'object',
                    properties: {
                      permits: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['permit_id', 'permit_number', 'permit_type'],
                          properties: {
                            permit_id: {
                              type: 'number',
                              minimum: 1
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
                      required: [
                        'survey_funding_source_id',
                        'survey_id',
                        'funding_source_id',
                        'amount',
                        'revision_count'
                      ],
                      properties: {
                        survey_funding_source_id: {
                          type: 'number',
                          minimum: 1
                        },
                        survey_id: {
                          type: 'number',
                          minimum: 1
                        },
                        funding_source_id: {
                          type: 'number',
                          minimum: 1
                        },
                        funding_source_name: {
                          type: 'string'
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
                  partnerships: {
                    title: 'Survey partnerships',
                    type: 'object',
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
                  purpose_and_methodology: {
                    description: 'Survey Details',
                    type: 'object',
                    required: [
                      'field_method_id',
                      'additional_details',
                      'intended_outcome_id',
                      'ecological_season_id',
                      'vantage_code_ids',
                      'revision_count'
                    ],
                    properties: {
                      field_method_id: {
                        type: 'number'
                      },
                      additional_details: {
                        type: 'string',
                        nullable: true
                      },
                      intended_outcome_id: {
                        type: 'number',
                        nullable: true
                      },
                      ecological_season_id: {
                        type: 'number',
                        nullable: true
                      },
                      vantage_code_ids: {
                        type: 'array',
                        items: {
                          type: 'number'
                        }
                      }
                    }
                  },
                  proprietor: {
                    description: 'Survey Proprietor Details',
                    type: 'object',
                    nullable: true,
                    required: [
                      'category_rationale',
                      'disa_required',
                      'first_nations_id',
                      'first_nations_name',
                      'proprietor_name',
                      'proprietor_type_id',
                      'proprietor_type_name'
                    ],
                    properties: {
                      category_rationale: {
                        type: 'string'
                      },
                      disa_required: {
                        type: 'boolean'
                      },
                      first_nations_id: {
                        type: 'number',
                        nullable: true
                      },
                      first_nations_name: {
                        type: 'string',
                        nullable: true
                      },
                      proprietor_name: {
                        type: 'string'
                      },
                      proprietor_type_id: {
                        type: 'number'
                      },
                      proprietor_type_name: {
                        type: 'string'
                      }
                    }
                  },
                  location: {
                    description: 'Survey location Details',
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
                      }
                    }
                  }
                }
              },
              surveySupplementaryData: {
                description: 'Survey supplementary data',
                type: 'object',
                required: ['survey_metadata_publish'],
                properties: {
                  survey_metadata_publish: {
                    description: 'Survey metadata publish record',
                    type: 'object',
                    nullable: true,
                    required: [
                      'survey_metadata_publish_id',
                      'survey_id',
                      'event_timestamp',
                      'queue_id',
                      'create_date',
                      'create_user',
                      'update_date',
                      'update_user',
                      'revision_count'
                    ],
                    properties: {
                      survey_metadata_publish_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      survey_id: {
                        type: 'integer',
                        minimum: 1
                      },
                      event_timestamp: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        description: 'ISO 8601 date string for the project start date'
                      },
                      queue_id: {
                        type: 'integer',
                        minimum: 1
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

export function getSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyData = await surveyService.getSurveyById(surveyId);

      const surveySupplementaryData = await surveyService.getSurveySupplementaryDataById(Number(req.params.surveyId));

      await connection.commit();

      return res.status(200).json({ surveyData: surveyData, surveySupplementaryData: surveySupplementaryData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
