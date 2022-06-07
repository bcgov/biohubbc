import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { geoJsonFeature } from '../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../services/survey-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/view');

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
                  'funding',
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
                      'end_date',
                      'biologist_first_name',
                      'biologist_last_name',
                      'publish_date',
                      'revision_count'
                    ],
                    properties: {
                      survey_name: {
                        type: 'string'
                      },
                      start_date: {
                        type: 'string',
                        format: 'date',
                        description: 'ISO 8601 date string for the funding end_date'
                      },
                      end_date: {
                        type: 'string',
                        format: 'date',
                        description: 'ISO 8601 date string for the funding end_date'
                      },
                      biologist_first_name: {
                        type: 'string'
                      },
                      biologist_last_name: {
                        type: 'string'
                      },
                      publish_date: {
                        oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                        nullable: true,
                        description: 'Determines if the record has been published'
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
                    required: ['permit_number', 'permit_type'],
                    properties: {
                      permit_number: {
                        type: 'string',
                        nullable: true
                      },
                      permit_type: {
                        type: 'string',
                        nullable: true
                      }
                    }
                  },
                  funding: {
                    description: 'Survey Funding Sources',
                    type: 'object',
                    properties: {
                      funding_sources: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: [
                            'pfs_id',
                            'agency_name',
                            'funding_amount',
                            'funding_start_date',
                            'funding_end_date'
                          ],
                          properties: {
                            pfs_id: {
                              type: 'number',
                              nullable: true
                            },
                            agency_name: {
                              type: 'string',
                              nullable: true
                            },
                            funding_amount: {
                              type: 'number',
                              nullable: true
                            },
                            funding_start_date: {
                              type: 'string',
                              nullable: true,
                              description: 'ISO 8601 date string'
                            },
                            funding_end_date: {
                              type: 'string',
                              nullable: true,
                              description: 'ISO 8601 date string'
                            }
                          }
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
                      'surveyed_all_areas',
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
                      },
                      surveyed_all_areas: {
                        type: 'string',
                        enum: ['true', 'false']
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
                          ...(geoJsonFeature as object)
                        }
                      }
                    }
                  }
                }
              },
              surveySupplementaryData: {
                type: 'object',
                required: ['occurrence_submission', 'summary_result'],
                properties: {
                  occurrence_submission: {
                    description: 'Occurrence Submission',
                    type: 'object',
                    nullable: true,
                    required: ['id'],
                    properties: {
                      id: {
                        description: 'A survey occurrence submission ID',
                        type: 'number',
                        nullable: true,
                        example: 1
                      }
                    }
                  },
                  summary_result: {
                    description: 'Summary Result',
                    type: 'object',
                    nullable: true,
                    required: ['id'],
                    properties: {
                      id: {
                        description: 'A survey summary result ID',
                        type: 'number',
                        nullable: true,
                        example: 1
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
