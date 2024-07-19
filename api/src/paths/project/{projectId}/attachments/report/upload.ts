import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/http-error';
import { fileSchema } from '../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { scanFileForVirus, uploadFileToS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/report/upload');

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
  uploadMedia()
];
POST.apiDoc = {
  description: 'Upload a project-specific attachment.',
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
    }
  ],
  requestBody: {
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media', 'attachmentMeta'],
          properties: {
            media: {
              description: 'Attachment report upload file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: fileSchema
            },
            attachmentMeta: {
              type: 'object',
              additionalProperties: false,
              required: ['title', 'year_published', 'authors', 'description'],
              properties: {
                title: {
                  type: 'string'
                },
                year_published: {
                  type: 'string',
                  description:
                    'Year the report is published. (Note: Content-Type: multipart/form-data requires all parameters to be strings.)'
                },
                authors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['first_name', 'last_name'],
                    properties: {
                      first_name: {
                        type: 'string'
                      },
                      last_name: {
                        type: 'string'
                      }
                    }
                  }
                },
                description: {
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
      description: 'Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            description: 'Result object',
            required: ['attachmentId', 'revision_count'],
            properties: {
              attachmentId: {
                type: 'number'
              },
              revision_count: {
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
 * Also adds the metadata to the project_attachment DB table
 * Does nothing if no media is present in the request.
 *
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    console.log({ files: req.files });
    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

    const rawMediaFile: Express.Multer.File = rawMediaArray[0];

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'file',
      file: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const attachmentService = new AttachmentService(connection);

      //Upsert a report attachment
      const upsertResult = await attachmentService.upsertProjectReportAttachment(
        rawMediaFile,
        Number(req.params.projectId),
        req.body.attachmentMeta
      );

      // Upload file to S3
      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, upsertResult.key, metadata);

      await connection.commit();

      return res
        .status(200)
        .json({ attachmentId: upsertResult.project_report_attachment_id, revision_count: upsertResult.revision_count });
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
