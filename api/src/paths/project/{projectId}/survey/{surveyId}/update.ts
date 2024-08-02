import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { PutSurveyObject } from '../../../../../models/survey-update';
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
} from '../../../../../openapi/schemas/survey';
import { surveyParticipationAndSystemUserSchema } from '../../../../../openapi/schemas/user';
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
          additionalProperties: false,
          properties: {
            survey_details: surveyDetailsSchema,
            species: surveySpeciesSchema,
            permit: surveyPermitSchema,
            funding_sources: {
              type: 'array',
              items: surveyFundingSourceDataSchema
            },
            partnerships: surveyPartnershipsSchema,
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
                  type: 'number',
                  nullable: true
                },
                disa_required: {
                  type: 'string'
                }
              }
            },
            purpose_and_methodology: surveyPurposeAndMethodologySchema,
            locations: {
              description: 'Survey location data',
              type: 'array',
              items: surveyLocationSchema
            },
            site_selection: surveySiteSelectionSchema,
            participants: {
              type: 'array',
              items: {
                ...surveyParticipationAndSystemUserSchema
              }
            },
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
  },
  responses: {
    200: {
      description: 'Survey with matching surveyId.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey Response Object',
            type: 'object',
            additionalProperties: false,
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

export function updateSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const sanitizedPutSurveyData = new PutSurveyObject(req.body);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      await surveyService.updateSurvey(surveyId, sanitizedPutSurveyData);

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
