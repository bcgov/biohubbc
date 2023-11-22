import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { PlatformService } from '../../services/platform-service';
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
  tags: ['survey', 'dwca', 'biohub'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Survey observation submission file to upload',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['surveyUUID', 'surveyId', 'data'],
          properties: {
            surveyUUID: {
              type: 'string',
              description: 'Survey UUID'
            },
            surveyId: {
              type: 'number'
            },
            data: {
              description: 'All survey data to upload',
              type: 'object',
              required: ['additionalInformation'],
              properties: {
                additionalInformation: {
                  type: 'string',
                  description: 'Additional information to include in the upload'
                }
              }
              // required: ['observations', 'summary', 'reports', 'attachments'],
              // properties: {
              //   observations: {
              //     type: 'array',
              //     items: {
              //       type: 'object',
              //       properties: {}
              //     }
              //   },
              //   summary: {
              //     type: 'array',
              //     items: {
              //       type: 'object',
              //       properties: {}
              //     }
              //   },
              //   reports: {
              //     type: 'array',
              //     items: {
              //       type: 'object',
              //       properties: {}
              //     }
              //   },
              //   attachments: {
              //     type: 'array',
              //     items: {
              //       type: 'object',
              //       properties: {}
              //     }
              //   }
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
            properties: {
              submission_id: {
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
 * Publish survey data to Biohub.
 *
 * @return {*}  {RequestHandler}
 */
export function publishSurvey(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const { surveyUUID, surveyId, data } = req.body;

    try {
      await connection.open();

      const platformService = new PlatformService(connection);
      const response = await platformService.submitSurveyIdToBioHub(surveyUUID, surveyId, data);

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
