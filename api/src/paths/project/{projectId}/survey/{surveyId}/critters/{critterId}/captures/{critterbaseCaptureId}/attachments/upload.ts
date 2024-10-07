import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../../database/db';
import { fileSchema } from '../../../../../../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../../../../../../request-handlers/security/authorization';
import { CritterAttachmentService } from '../../../../../../../../../../services/critter-attachment-service';
import {
  bulkDeleteFilesFromS3,
  generateS3FileKey,
  uploadFileToS3
} from '../../../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  '/api/project/{projectId}/survey/{surveyId}/critters/{critterId}/captures/{critterbaseCaptureId}/attachments/upload'
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
  uploadCaptureAttachments()
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
      name: 'critterbaseCaptureId',
      schema: {
        type: 'string',
        format: 'uuid'
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
          required: ['media'],
          additionalProperties: false,
          properties: {
            media: {
              description: 'Uploaded Capture attachments.',
              type: 'array',
              items: fileSchema
            },
            delete_ids: {
              description: 'Critter Capture Attachment IDs to delete.',
              type: 'array',
              items: {
                type: 'string',
                format: 'integer'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Successfull upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['attachment_ids'],
            additionalProperties: false,
            properties: {
              attachment_ids: {
                description: 'The IDs of the capture attachments that were uploaded.',
                type: 'array',
                items: {
                  type: 'integer',
                  minItems: 1
                }
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
 * Optionally deletes any attachments flagged for deletion.
 *
 * @returns {RequestHandler}
 */
export function uploadCaptureAttachments(): RequestHandler {
  return async (req, res) => {
    const rawMediaFiles = req.files as Express.Multer.File[];
    const deleteIds: number[] = req.body.delete_ids?.map(Number) ?? [];
    const projectId = Number(req.params.projectId);
    const surveyId = Number(req.params.surveyId);
    const critterId = Number(req.params.critterId);
    const critterbaseCaptureId = req.params.critterbaseCaptureId;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const critterAttachmentService = new CritterAttachmentService(connection);

      // Delete any flagged attachments
      if (deleteIds.length) {
        // Delete the attachments from the database and get the S3 keys
        const s3Keys = await critterAttachmentService.deleteCritterCaptureAttachments(surveyId, deleteIds);
        // Bulk delete the files from S3
        await bulkDeleteFilesFromS3(s3Keys);
      }

      // Upload each file to S3 and store the file details in the database
      const uploadPromises = rawMediaFiles.map(async (file) => {
        // Generate the S3 key for the file - used only on new inserts
        const s3Key = generateS3FileKey({
          projectId: projectId,
          surveyId: surveyId,
          fileName: file.originalname,
          folder: 'captures'
        });

        // Store the file details in the database
        const upsertResult = await critterAttachmentService.upsertCritterCaptureAttachment({
          critter_id: critterId,
          critterbase_capture_id: critterbaseCaptureId,
          file_name: file.originalname,
          file_size: file.size,
          key: s3Key
        });

        await uploadFileToS3(file, upsertResult.key);

        return upsertResult.critter_capture_attachment_id;
      });

      // In parallel, upload all the files to S3 and store the file details in the database
      const attachmentIds = await Promise.all(uploadPromises);

      await connection.commit();

      return res.status(200).json({ attachment_ids: attachmentIds });
    } catch (error) {
      defaultLog.error({ label: 'uploadCaptureAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
