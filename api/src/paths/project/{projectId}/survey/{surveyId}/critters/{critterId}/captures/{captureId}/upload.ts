import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../../errors/http-error';
import { fileSchema } from '../../../../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../../../../services/attachment-service';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../../utils/logger';
import { getFileFromRequest } from '../../../../../../../../../utils/request';

const defaultLog = getLogger(
  '/api/project/{projectId}/survey/{surveyId}/critters/{critterId}/captures/{captureId}/upload'
);

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
  description: 'Upload a Critter capture-specific attachment.',
  tags: ['attachment'],
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
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'captureId',
      schema: {
        type: 'string',
        format: 'uuid',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Attachment import file.',
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
      description: 'Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['attachmentId', 'revision_count'],
            properties: {
              critter_capture_attachment_id: {
                type: 'number'
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Uploads any media in the request to S3, adding their keys to the request.
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaFile = getFileFromRequest(req);

    defaultLog.debug({
      label: 'uploadMedia',
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

      const attachmentService = new AttachmentService(connection);

      const upsertResult = await attachmentService.upsertCritterCaptureAttachment({
        critter_id: Number(req.params.critterId),
        critterbase_capture_id: req.params.captureId,
        file_name: rawMediaFile.originalname,
        file_size: rawMediaFile.size,
        file_type: rawMediaFile.mimetype,
        // Key will only be set on successful 'insert' upload
        key: generateS3FileKey({
          projectId: Number(req.params.projectId),
          surveyId: Number(req.params.surveyId),
          fileName: rawMediaFile.originalname,
          folder: 'captures'
        })
      });

      const result = await uploadFileToS3(rawMediaFile, upsertResult.key);

      defaultLog.debug({ label: 'uploadMedia', message: 'result', result });

      await connection.commit();

      return res.status(200).json({
        critter_capture_attachment_id: upsertResult.critter_capture_attachment_id
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
