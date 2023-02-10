import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { geoJsonFeature } from '../../../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../services/survey-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update/get');

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
  getSurveyForUpdate()
];

GET.apiDoc = {
  description: 'Get a project survey, for update purposes.',
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
            required: ['surveyData'],
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
                  funding: {
                    description: 'Survey Funding Sources',
                    type: 'object',
                    properties: {
                      funding_sources: {
                        type: 'array',
                        items: {
                          type: 'integer'
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
                      'survey_data_proprietary',
                      'proprietor_type_name',
                      'proprietary_data_category',
                      'first_nations_name',
                      'first_nations_id',
                      'category_rationale',
                      'proprietor_name',
                      'disa_required'
                    ],
                    properties: {
                      survey_data_proprietary: {
                        type: 'string'
                      },
                      proprietor_type_name: {
                        type: 'string',
                        nullable: true
                      },
                      disa_required: {
                        type: 'string'
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
                        type: 'string',
                        nullable: true
                      },
                      proprietary_data_category: {
                        type: 'number',
                        nullable: true
                      },
                      category_rationale: {
                        type: 'string',
                        nullable: true
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
              }
            }
          }
        }
      }
    }
  }
};

export function getSurveyForUpdate(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyObject = await surveyService.getSurveyById(surveyId);

      let proprietor: any = surveyObject.proprietor;

      if (surveyObject.proprietor?.proprietor_type_id) {
        proprietor['survey_data_proprietary'] = 'true';
        proprietor['proprietary_data_category'] = surveyObject.proprietor?.proprietor_type_id;
        proprietor['first_nations_id'] =
          surveyObject.proprietor?.first_nations_id !== null ? surveyObject.proprietor?.first_nations_id : 0;
        proprietor['disa_required'] = surveyObject.proprietor?.disa_required === true ? 'true' : 'false';
      } else {
        proprietor = {
          survey_data_proprietary: 'false',
          proprietor_type_name: '',
          proprietary_data_category: 0,
          first_nations_name: '',
          first_nations_id: 0,
          category_rationale: '',
          proprietor_name: '',
          disa_required: 'false'
        };
      }

      const funding: any = [];

      if (surveyObject.funding && surveyObject.funding.funding_sources) {
        surveyObject.funding.funding_sources.forEach((fund) => {
          funding.push(fund.pfs_id);
        });
      }

      const surveyData = {
        ...surveyObject,
        proprietor: proprietor,
        funding: {
          funding_sources: funding
        },
        agreements: {
          sedis_procedures_accepted: 'true',
          foippa_requirements_accepted: 'true'
        }
      };

      await connection.commit();

      return res.status(200).json({ surveyData: surveyData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
