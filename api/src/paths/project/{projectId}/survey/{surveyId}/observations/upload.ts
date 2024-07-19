import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { csvFileSchema } from '../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { scanFileForVirus, uploadFileToS3 } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/upload');

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
  description: 'Upload survey observation submission file.',
  tags: ['observations'],
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
    description: 'Survey observation submission file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'A survey observation submission file.',
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
              submissionId: {
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
 * Uploads a media file to S3 and inserts a matching record in the `survey_observation_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaFile = req.files[0];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      // Insert a new record in the `survey_observation_submission` table
      const observationService = new ObservationService(connection);
      const { submission_id: submissionId, key } = await observationService.insertSurveyObservationSubmission(
        rawMediaFile,
        Number(req.params.projectId),
        Number(req.params.surveyId)
      );

      // Upload file to S3
      const metadata = {
        filename: rawMediaFile.originalname,
        username: req['auth_payload']?.preferred_username ?? '',
        email: req['auth_payload']?.email ?? ''
      };

      const result = await uploadFileToS3(rawMediaFile, key, metadata);

      defaultLog.debug({ label: 'uploadMedia', message: 'result', result });

      await connection.commit();

      return res.status(200).json({ submissionId });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
