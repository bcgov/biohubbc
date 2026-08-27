import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { HTTP400, HTTP403 } from '../../errors/http-error';
import { BiohubFeatureType, PUBLISHABLE_FEATURE_TYPES } from '../../models/biohub-create';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PlatformService } from '../../services/platform-service';
import type { SubmissionSubmitter } from '../../services/platform-service.interface';
import { SurveyService } from '../../services/survey-service';
import { isBioHubIdentitySource } from '../../utils/keycloak-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('/api/publish/survey');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.body.projectId),
          discriminator: 'ProjectPermission'
        }
      ]
    };
  }),
  publishSurvey()
];

POST.apiDoc = {
  description: 'Publish Survey data to Biohub.',
  tags: ['survey', 'biohub'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Survey observation submission file to upload',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['projectId', 'surveyId', 'data'],
          properties: {
            projectId: {
              type: 'integer',
              minimum: 1
            },
            surveyId: {
              type: 'integer',
              minimum: 1
            },
            data: {
              description: 'Additional data to include in the submission to BioHub',
              type: 'object',
              additionalProperties: false,
              required: ['submissionComment', 'agreement1', 'agreement2', 'agreement3'],
              properties: {
                submissionComment: {
                  type: 'string',
                  description:
                    'Submission comment to include in the submission to BioHub. May include sensitive information.'
                },
                agreement1: {
                  type: 'boolean',
                  enum: [true],
                  description: 'Publishing agreement 1. Agreement must be accepted.'
                },
                agreement2: {
                  type: 'boolean',
                  enum: [true],
                  description: 'Publishing agreement 2. Agreement must be accepted.'
                },
                agreement3: {
                  type: 'boolean',
                  enum: [true],
                  description: 'Publishing agreement 3. Agreement must be accepted.'
                },
                featureTypes: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [...PUBLISHABLE_FEATURE_TYPES]
                  },
                  description: 'Selected survey feature types to include in the BioHub submission package.'
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
      description: 'Upload OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              submission_uuid: {
                type: 'string',
                format: 'uuid',
                description: 'The UUID of the submission'
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

/**
 * Publish survey data to Biohub.
 *
 * @return {*}  {RequestHandler}
 */
export function publishSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    const { projectId, surveyId, data } = req.body as {
      projectId: number;
      surveyId: number;
      data: { submissionComment: string; featureTypes?: BiohubFeatureType[] };
    };

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);
      const surveyData = await surveyService.getSurveyData(surveyId);

      if (surveyData.project_id !== projectId) {
        throw new HTTP403('Invalid project or survey identifier.');
      }

      const platformService = new PlatformService(connection);
      const systemUser = req.system_user;

      if (
        !systemUser?.user_guid ||
        !systemUser.user_identifier ||
        !isBioHubIdentitySource(systemUser.identity_source)
      ) {
        throw new HTTP400('Authenticated user does not have a BioHub-compatible identity.');
      }

      const submitters: SubmissionSubmitter[] = [
        {
          guid: systemUser.user_guid,
          identifier: systemUser.user_identifier,
          identitySource: systemUser.identity_source
        }
      ];
      const response = await platformService.submitSurveyToBioHub(surveyId, data, submitters);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'publishSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
