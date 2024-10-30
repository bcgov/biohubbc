import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
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
  surveySpeciesSchema,
  surveySupplementaryDataSchema
} from '../../../../../openapi/schemas/survey';
import { surveyParticipationAndSystemUserSchema } from '../../../../../openapi/schemas/user';
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
            additionalProperties: false,
            required: ['surveyData', 'surveySupplementaryData'],
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
                  proprietor: surveyProprietorSchema,
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
                  }
                }
              },
              surveySupplementaryData: surveySupplementaryDataSchema
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
      $ref: '#/components/responses/403'
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

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveyData = await surveyService.getSurveyById(surveyId);

      // @TODO safe to delete survey supplementary data code?
      const surveySupplementaryData = await surveyService.getSurveySupplementaryDataById(Number(req.params.surveyId));

      await connection.commit();

      return res.status(200).json({ surveyData: surveyData, surveySupplementaryData: surveySupplementaryData });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyForView', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
