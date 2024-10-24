import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler, userHasValidRole } from '../../../../../../request-handlers/security/authorization';
import { ExportService } from '../../../../../../services/export-services/export-service';
import {
  ExportSurveyConfig,
  ExportSurveyStrategy
} from '../../../../../../services/export-services/survey/export-survey-strategy';
import { generateS3ExportKey } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { getSystemUserFromRequest } from '../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/export/index.ts');

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
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        }
      ]
    };
  }),
  exportData()
];

POST.apiDoc = {
  description: 'Export SIMS data.',
  tags: ['export'],
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
  requestBody: {
    description: 'Export SIMS data request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['config'],
          properties: {
            config: {
              type: 'object',
              additionalProperties: false,
              required: ['metadata', 'sampling_data', 'observation_data', 'telemetry_data', 'animal_data', 'artifacts'],
              description: 'Configure which data to include in the export.',
              properties: {
                metadata: {
                  type: 'boolean'
                },
                sampling_data: {
                  type: 'boolean'
                },
                observation_data: {
                  type: 'boolean'
                },
                telemetry_data: {
                  type: 'boolean'
                },
                animal_data: {
                  type: 'boolean'
                },
                artifacts: {
                  type: 'boolean'
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
      description: 'Response containing the signed url of the export file.',
      content: {
        'text/plain': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['presignedS3Urls'],
            properties: {
              presignedS3Urls: {
                type: 'array',
                items: {
                  type: 'string'
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
 * Export survey information.
 *
 * @return {*}  {RequestHandler}
 */
export function exportData(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);
      const config = req.body.config as ExportSurveyConfig;

      const systemUser = getSystemUserFromRequest(req);
      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        systemUser.role_names
      );

      await connection.open();

      const exportSurveyStrategy = new ExportSurveyStrategy({ surveyId, config, connection, isUserAdmin });

      const exportService = new ExportService(connection);

      const response = await exportService.export({
        exportStrategies: [exportSurveyStrategy],
        s3Key: generateS3ExportKey()
      });

      await connection.commit();

      return res.status(200).json({ presignedS3Urls: response });
    } catch (error) {
      defaultLog.error({ label: 'publishSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
