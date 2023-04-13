import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/http-error';
import { SurveySupplementaryData } from '../../../models/survey-view';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { SurveyService } from '../../../services/survey-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/surveys');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyList()
];

GET.apiDoc = {
  description: 'Get all Surveys.',
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
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
                      required: [
                        'focal_species',
                        'focal_species_names',
                        'ancillary_species',
                        'ancillary_species_names'
                      ],
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
                            ...(geoJsonFeature as object)
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
 * Get all surveys.
 *
 * @returns {RequestHandler}
 */
export function getSurveyList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);
    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyIdsResponse = await surveyService.getSurveyIdsByProjectId(Number(req.params.projectId));

      const surveyIds = surveyIdsResponse.map((item: { id: any }) => item.id);

      const surveys = await Promise.all(
        surveyIds.map(async (surveyId) => {
          const survey = await surveyService.getSurveyById(surveyId);
          const supplementaryData = ({ survey_metadata_publish: null } as unknown) as SurveySupplementaryData; //hard coded null for testing

          // const supplementaryData = ({
          //   survey_metadata_publish: {
          //     survey_metadata_publish_id: 1,
          //     survey_id: 1,
          //     event_timestamp: '2021-01-01',
          //     queue_id: 1,
          //     create_date: '2021-01-01',
          //     create_user: 1,
          //     update_date: '2021-01-01',
          //     update_user: 1,
          //     revision_count: 1
          //   }
          // } as unknown) as SurveySupplementaryData; //Hard coded for now

          return { surveyData: survey, surveySupplementaryData: supplementaryData };
        })
      );

      await connection.commit();

      return res.status(200).json(surveys);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
