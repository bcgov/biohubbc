'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { uploadFileToS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';
import { upsertProjectAttachment } from '../../../project';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/upload');

export const POST: Operation = [uploadMedia()];
POST.apiDoc = {
  description: 'Upload project-specific artifacts.',
  tags: ['artifacts'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    }
  ],
  requestBody: {
    description: 'Artifacts upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              type: 'array',
              description: 'An array of artifacts to upload',
              items: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Artifacts upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                mediaKey: {
                  type: 'string',
                  description: 'The S3 unique key for this file.'
                },
                lastModified: {
                  type: 'string',
                  description: 'The date the object was last modified'
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
 * Also adds the metadata to the project_attachment DB table
 * Does nothing if no media is present in the request.
 *
 * TODO: make media handling an extension that can be added to different endpoints/record types
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'uploadMedia', message: 'files.length', files: req?.files?.length });

    if (!req.files || !req.files.length) {
      // no media objects included, skipping media upload step
      throw new HTTP400('Missing upload data');
    }

    if (!req.params.projectId || !req.params.projectId.length) {
      throw new HTTP400('Missing projectId');
    }

    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];
    const connection = getDBConnection(req['keycloak_token']);

    // Insert file metadata into project_attachment table
    try {
      await connection.open();

      const insertProjectAttachmentsPromises =
        rawMediaArray.map((file: Express.Multer.File) =>
          upsertProjectAttachment(file, Number(req.params.projectId), connection)
        ) || [];

      await Promise.all([...insertProjectAttachmentsPromises]);

      // Upload files to S3
      const s3UploadPromises: Promise<ManagedUpload.SendData>[] = [];

      rawMediaArray.forEach((file: Express.Multer.File) => {
        if (!file) {
          return;
        }

        const key = req.params.projectId + '/' + file.originalname;

        const metadata = {
          filename: key,
          username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
          email: (req['auth_payload'] && req['auth_payload'].email) || ''
        };

        defaultLog.debug({ label: 'uploadMedia', message: 'metadata', metadata });

        s3UploadPromises.push(uploadFileToS3(file, metadata));
      });

      const results = await Promise.all(s3UploadPromises);
      defaultLog.debug({ label: 'uploadMedia', message: 'results', results });

      await connection.commit();

      return res.status(200).json(results.map((result) => result.Key));
    } catch (error) {
      defaultLog.debug({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw new HTTP400('Upload was not successful');
    } finally {
      connection.release();
    }
  };
}
