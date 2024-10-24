import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { PostSurveyObject } from '../../../../models/survey-create';
import {
  surveyBlockSchema,
  surveyDetailsSchema,
  surveyFundingSourceDataSchema,
  surveyLocationSchema,
  surveyPartnershipsSchema,
  surveyPermitSchema,
  surveyProprietorSchema,
  surveyPurposeAndMethodologySchema,
  surveySpeciesSchema
} from '../../../../openapi/schemas/survey';
import { surveyParticipationAndSystemUserSchema } from '../../../../openapi/schemas/user';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../services/survey-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/create');

export const POST: Operation = [
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
  createSurvey()
];

POST.apiDoc = {
  description: 'Create a new Survey.',
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
    }
  ],
  requestBody: {
    description: 'Survey post request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'SurveyProject post request object',
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
            'site_selection',
            'agreements',
            'participants'
          ],
          properties: {
            survey_details: {
              ...surveyDetailsSchema,
              properties: {
                ...surveyDetailsSchema.properties,
                id: { type: 'integer', nullable: true },
                project_id: { type: 'integer', nullable: true }
              }
            },
            species: surveySpeciesSchema,
            permit: surveyPermitSchema,
            funding_sources: {
              type: 'array',
              items: surveyFundingSourceDataSchema
            },
            partnerships: surveyPartnershipsSchema,
            proprietor: surveyProprietorSchema,
            purpose_and_methodology: surveyPurposeAndMethodologySchema,
            locations: {
              description: 'Survey location data',
              type: 'array',
              items: surveyLocationSchema
            },
            site_selection: {
              title: 'survey site selection response object',
              type: 'object',
              additionalProperties: false,
              required: ['strategies', 'stratums'],
              properties: {
                strategies: {
                  description: 'Strategies',
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                },
                stratums: {
                  description: 'Stratums',
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['name', 'description'],
                    properties: {
                      name: {
                        description: 'Name',
                        type: 'string'
                      },
                      description: {
                        description: 'Description',
                        type: 'string',
                        nullable: true
                      },
                      survey_id: {
                        description: 'Survey id',
                        type: 'integer',
                        nullable: true
                      },
                      survey_stratum_id: {
                        description: 'Survey stratum id',
                        type: 'integer',
                        nullable: true,
                        minimum: 1
                      },
                      revision_count: {
                        description: 'Revision count',
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            },
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
      description: 'Survey response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['id'],
            properties: {
              id: {
                type: 'integer',
                minimum: 1
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

export function createSurvey(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);

    const sanitizedPostSurveyData = new PostSurveyObject(req.body);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const surveyId = await surveyService.createSurvey(projectId, sanitizedPostSurveyData);

      await connection.commit();

      return res.status(200).json({ id: surveyId });
    } catch (error) {
      defaultLog.error({ label: 'createSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
