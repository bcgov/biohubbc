import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  surveyBlockSchema,
  surveyDetailsSchema,
  surveyFundingSourceDataSchema,
  surveyLocationSchema,
  surveyPartnershipsSchema,
  surveyPermitSchema,
  surveyProprietorSchema,
  surveyPurposeAndMethodologySchema,
  surveySiteSelectionSchema,
  surveySpeciesSchema
} from '../../../../../../openapi/schemas/survey';
import { surveyParticipationAndSystemUserSchema } from '../../../../../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../../../services/survey-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/update/get');

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
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
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
            additionalProperties: false,
            required: ['surveyData'],
            properties: {
              surveyData: {
                type: 'object',
                additionalProperties: false,
                required: [
                  'survey_details',
                  'species',
                  'permit',
                  'funding_sources',
                  'partnerships',
                  'proprietor',
                  'purpose_and_methodology',
                  'locations',
                  'site_selection'
                ],
                properties: {
                  survey_details: surveyDetailsSchema,
                  species: surveySpeciesSchema,
                  permit: surveyPermitSchema,
                  funding_sources: {
                    type: 'array',
                    items: surveyFundingSourceDataSchema
                  },
                  partnerships: surveyPartnershipsSchema,
                  purpose_and_methodology: surveyPurposeAndMethodologySchema,
                  proprietor: {
                    ...surveyProprietorSchema,
                    properties: {
                      ...surveyProprietorSchema.properties,
                      survey_data_proprietary: {
                        type: 'string'
                      },
                      proprietary_data_category: {
                        type: 'number'
                      },
                      first_nations_id: {
                        type: 'number'
                      },
                      disa_required: {
                        type: 'string'
                      }
                    }
                  },
                  locations: {
                    description: 'Survey location data',
                    type: 'array',
                    items: surveyLocationSchema
                  },
                  participants: {
                    type: 'array',
                    items: {
                      ...surveyParticipationAndSystemUserSchema
                    }
                  },
                  site_selection: surveySiteSelectionSchema,
                  blocks: {
                    type: 'array',
                    items: surveyBlockSchema
                  },
                  agreements: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['sedis_procedures_accepted', 'foippa_requirements_accepted'],
                    properties: {
                      sedis_procedures_accepted: {
                        type: 'string'
                      },
                      foippa_requirements_accepted: {
                        type: 'string'
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

/**
 * @TODO remove, per https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-522
 */
export function getSurveyForUpdate(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

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

      const surveyData = {
        ...surveyObject,
        proprietor: proprietor,
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
