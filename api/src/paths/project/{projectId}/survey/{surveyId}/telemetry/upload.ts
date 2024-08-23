import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TelemetryService } from '../../../../../../services/telemetry-service';
import { scanFileForVirus, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';
import { getFileFromRequest } from '../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/telemetry/upload');

export const POST: Operation = [
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
  uploadMedia()
];

POST.apiDoc = {
  description: 'Upload survey telemetry submission file.',
  tags: ['telemetry'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey telemetry submission file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            media: {
              description: 'A survey telemetry submission file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: csvFileSchema
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
 * Uploads a media file to S3 and inserts a matching record in the `survey_telemetry_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaFile = getFileFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      // Insert a new record in the `survey_telemetry_submission` table
      const service = new TelemetryService(connection);
      const { submission_id: submissionId, key } = await service.insertSurveyTelemetrySubmission(
        rawMediaFile,
        Number(req.params.projectId),
        Number(req.params.surveyId)
      );

      // Upload file to S3
      const metadata = {
        filename: rawMediaFile.originalname,
        username: req.keycloak_token?.preferred_username ?? '',
        email: req.keycloak_token?.email ?? ''
      };

      const result = await uploadFileToS3(rawMediaFile, key, metadata);

      defaultLog.debug({ label: 'uploadMedia', message: 'result', result });

      await connection.commit();

      return res.status(200).json({ submission_id: submissionId });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
