import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { GetViewSurveyDetailsData } from '../../../../../models/survey-view';
import { GetSurveyProprietorData, GetSurveyPurposeAndMethodologyData } from '../../../../../models/survey-view-update';
import { geoJsonFeature } from '../../../../../openapi/schemas/geoJson';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
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
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey get response object, for view purposes',
            type: 'object',
            required: ['survey_details', 'survey_purpose_and_methodology', 'survey_proprietor'],
            properties: {
              survey_details: {
                description: 'Survey Details',
                type: 'object',
                required: [
                  'id',
                  'occurrence_submission_id',
                  'focal_species',
                  'ancillary_species',
                  'biologist_first_name',
                  'biologist_last_name',
                  'completion_status',
                  'start_date',
                  'end_date',
                  'funding_sources',
                  'geometry',
                  'permit_number',
                  'permit_type',
                  'publish_date',
                  'revision_count',
                  'survey_area_name',
                  'survey_name'
                ],
                properties: {
                  id: {
                    description: 'Survey id',
                    type: 'number'
                  },
                  ancillary_species: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  focal_species: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
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
                  funding_sources: {
                    type: 'array',
                    items: {
                      title: 'survey funding agency',
                      type: 'object',
                      required: ['agency_name', 'funding_amount', 'funding_start_date', 'funding_end_date'],
                      properties: {
                        pfs_id: {
                          type: 'number'
                        },
                        agency_name: {
                          type: 'string'
                        },
                        funding_amount: {
                          type: 'number'
                        },
                        funding_start_date: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        },
                        funding_end_date: {
                          type: 'string',
                          description: 'ISO 8601 date string'
                        }
                      }
                    }
                  },
                  geometry: {
                    type: 'array',
                    items: {
                      ...(geoJsonFeature as object)
                    }
                  },
                  occurrence_submission_id: {
                    description: 'A survey occurrence submission ID',
                    type: 'number',
                    example: 1
                  },
                  permit_number: {
                    type: 'string'
                  },
                  permit_type: {
                    type: 'string'
                  },
                  publish_date: {
                    type: 'string'
                  },
                  revision_count: {
                    type: 'number'
                  },
                  survey_area_name: {
                    type: 'string'
                  },
                  survey_name: {
                    type: 'string'
                  }
                }
              },
              survey_purpose_and_methodology: {
                description: 'Survey Details',
                type: 'object',
                required: [
                  'id',
                  'field_method_id',
                  'additional_details',
                  'intended_outcome_id',
                  'ecological_season_id',
                  'revision_count',
                  'vantage_code_ids'
                ],
                properties: {
                  id: {
                    type: 'number'
                  },
                  field_method_id: {
                    type: 'number'
                  },
                  additional_details: {
                    type: 'string'
                  },
                  intended_outcome_id: {
                    type: 'number'
                  },
                  ecological_season_id: {
                    type: 'number'
                  },
                  revision_count: {
                    type: 'number'
                  },
                  vantage_code_ids: {
                    type: 'array',
                    items: {
                      type: 'number'
                    }
                  }
                }
              },
              survey_proprietor: {
                description: 'Survey Details',
                type: 'object',
                //Note: do not make any of these fields required as the object can be null
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
                    type: 'number'
                  },
                  first_nations_name: {
                    type: 'string'
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

    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const [
        surveyBasicData,
        surveyPurposeAndMethodology,
        surveyFundingSourcesData,
        SurveySpeciesData,
        surveyProprietorData
      ] = await Promise.all([
        getSurveyBasicDataForView(surveyId, connection),
        getSurveyPurposeAndMethodologyDataForView(surveyId, connection),
        getSurveyFundingSourcesDataForView(surveyId, connection),
        getSurveySpeciesDataForView(surveyId, connection),
        getSurveyProprietorDataForView(surveyId, connection)
      ]);

      await connection.commit();

      const getSurveyData = new GetViewSurveyDetailsData({
        ...surveyBasicData,
        funding_sources: surveyFundingSourcesData,
        ...SurveySpeciesData
      });

      const getSurveyPurposeAndMethodology =
        (surveyPurposeAndMethodology && new GetSurveyPurposeAndMethodologyData(surveyPurposeAndMethodology))[0] || null;

      const getSurveyProprietorData =
        (surveyProprietorData && new GetSurveyProprietorData(surveyProprietorData)) || null;

      const result = {
        survey_details: getSurveyData,
        survey_purpose_and_methodology: getSurveyPurposeAndMethodology,
        survey_proprietor: getSurveyProprietorData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getSurveyBasicDataForView = async (surveyId: number, connection: IDBConnection): Promise<object> => {
  const sqlStatement = queries.survey.getSurveyBasicDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get survey basic data');
  }

  return (response && response.rows?.[0]) || null;
};

export const getSurveyPurposeAndMethodologyDataForView = async (
  surveyId: number,
  connection: IDBConnection
): Promise<object> => {
  const sqlStatement = queries.survey.getSurveyPurposeAndMethodologyForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get survey purpose and methodology data');
  }

  return (response && response.rows) || [];
};

export const getSurveyFundingSourcesDataForView = async (
  surveyId: number,
  connection: IDBConnection
): Promise<any[]> => {
  const sqlStatement = queries.survey.getSurveyFundingSourcesDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to get survey funding sources data');
  }

  return (response && response.rows) || [];
};

export const getSurveySpeciesDataForView = async (surveyId: number, connection: IDBConnection): Promise<any[]> => {
  const sqlStatement = queries.survey.getSurveySpeciesDataForViewSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get survey species data');
  }

  return (response && response.rows?.[0]) || null;
};

export const getSurveyProprietorDataForView = async (surveyId: number, connection: IDBConnection) => {
  const sqlStatement = queries.survey.getSurveyProprietorForUpdateSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows?.[0]) || null;
};
