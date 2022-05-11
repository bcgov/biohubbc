import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
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
  getSurveyForView()
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
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
            required: [
              'survey_details',
              'species',
              'permit',
              'funding_sources',
              'purpose_and_methodology',
              'proprietor',
              'occurrence_submission',
              'summary_result'
            ],
            properties: {
              survey_details: {
                description: 'Survey Details',
                type: 'object',
                required: [
                  'id',
                  'biologist_first_name',
                  'biologist_last_name',
                  'completion_status',
                  'start_date',
                  'end_date',
                  'geometry',
                  'publish_date',
                  'publish_status',
                  'survey_area_name',
                  'survey_name'
                ],
                properties: {
                  id: {
                    description: 'Survey id',
                    type: 'number'
                  },
                  biologist_first_name: {
                    type: 'string'
                  },
                  biologist_last_name: {
                    type: 'string'
                  },
                  completion_status: {
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
                  geometry: {
                    type: 'array',
                    items: {
                      ...(geoJsonFeature as object)
                    }
                  },
                  publish_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    nullable: true,
                    description: 'Determines if the record has been published'
                  },
                  publish_status: {
                    type: 'string'
                  },
                  survey_area_name: {
                    type: 'string'
                  },
                  survey_name: {
                    type: 'string'
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
              funding_sources: {
                description: 'Survey Funding Sources',
                type: 'array',
                items: {
                  type: 'object',
                  //required: ['pfs_id', 'agency_name', 'funding_amount', 'funding_start_date', 'funding_end_date'],
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
              },
              purpose_and_methodology: {
                description: 'Survey Details',
                type: 'object',
                // required: [
                //   'id',
                //   'field_method_id',
                //   'additional_details',
                //   'intended_outcome_id',
                //   'ecological_season_id',
                //   'vantage_code_ids',
                //   'surveyed_all_areas',
                //   'revision_count'
                // ],
                properties: {
                  id: {
                    type: 'number'
                  },
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
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              proprietor: {
                description: 'Survey Details',
                type: 'object',
                nullable: true,
                properties: {
                  survey_data_proprietary: {
                    type: 'string'
                  },
                  id: {
                    type: 'number'
                  },
                  category_rationale: {
                    type: 'string'
                  },
                  data_sharing_agreement_required: {
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
                  proprietary_data_category: {
                    type: 'number'
                  },
                  proprietary_data_category_name: {
                    type: 'string'
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              occurrence_submission: {
                description: 'Occurrence Submission',
                type: 'object',
                nullable: true,
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
 * Get a survey by projectId and surveyId.
 *
 * @returns {RequestHandler}
 */
export function getSurveyForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const result = await surveyService.getSurveyById(Number(req.params.surveyId));

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

// export const getSurveyFundingSourcesDataForView = async (
//   surveyId: number,
//   connection: IDBConnection
// ): Promise<any[]> => {
//   const sqlStatement = queries.survey.getSurveyFundingSourcesDataForViewSQL(surveyId);

//   if (!sqlStatement) {
//     throw new HTTP400('Failed to build SQL get statement');
//   }

//   const response = await connection.query(sqlStatement.text, sqlStatement.values);

//   if (!response) {
//     throw new HTTP400('Failed to get survey funding sources data');
//   }

//   return (response && response.rows) || [];
// };
