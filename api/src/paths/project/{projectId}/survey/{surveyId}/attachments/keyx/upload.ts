import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../../../constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { BctwUser } from '../../../../../../../models/bctw';
import { fileSchema } from '../../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import { BctwKeyxService } from '../../../../../../../services/bctw-service/bctw-keyx-service';
import { scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { checkFileForKeyx } from '../../../../../../../utils/media/media-utils';
import { getFileFromRequest } from '../../../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/keyx/upload');

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
  uploadKeyxMedia()
];

POST.apiDoc = {
  tags: ['attachment'],
  description: 'Upload a survey-specific keyx attachment.',
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Keyx Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Keyx import file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: fileSchema
            }
          }
        }
      }
    }
  },

  responses: {
    200: {
      description: 'Keyx Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['attachmentId', 'revision_count', 'keyxResults'],
            properties: {
              keyxResults: {
                type: 'object',
                additionalProperties: false,
                required: ['totalKeyxFiles', 'newRecords', 'existingRecords'],
                properties: {
                  totalKeyxFiles: { type: 'integer' },
                  newRecords: { type: 'integer' },
                  existingRecords: { type: 'integer' }
                }
              },
              attachmentId: {
                type: 'integer'
              },
              revision_count: {
                type: 'integer'
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/400'
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
 * Uploads any media in the request to S3, adding their keys to the request.
 * Also adds the metadata to the survey_attachment DB table
 * Does nothing if no media is present in the request.
 *
 * @returns {RequestHandler}
 */
export function uploadKeyxMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaFile = getFileFromRequest(req);

    defaultLog.debug({
      label: 'uploadKeyxMedia',
      message: 'files',
      files: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      // Send the file to BCTW Api
      if (!checkFileForKeyx(rawMediaFile)) {
        throw new HTTP400('The file must either be a keyx file or a zip containing only keyx files.');
      }

      const user: BctwUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };
      const bctwKeyxService = new BctwKeyxService(user);
      const bctwUploadResult = await bctwKeyxService.uploadKeyX(rawMediaFile);

      // Upsert attachment
      const attachmentService = new AttachmentService(connection);

      const upsertResult = await attachmentService.upsertSurveyAttachment(
        rawMediaFile,
        Number(req.params.projectId),
        Number(req.params.surveyId),
        ATTACHMENT_TYPE.KEYX
      );

      const metadata = {
        filename: rawMediaFile.originalname,
        username: req.keycloak_token?.preferred_username ?? '',
        email: req.keycloak_token?.email ?? ''
      };

      const result = await uploadFileToS3(rawMediaFile, upsertResult.key, metadata);

      defaultLog.debug({ label: 'uploadMedia', message: 'result', result });

      await connection.commit();

      return res.status(200).json({
        attachmentId: upsertResult.survey_attachment_id,
        revision_count: upsertResult.revision_count,
        keyxResults: bctwUploadResult
      });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
