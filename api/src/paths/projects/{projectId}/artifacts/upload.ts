'use strict';

import { ManagedUpload } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../constants/roles';
import { uploadFileToS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';
import { IMediaItem, MediaBase64 } from '../../../../models/media';

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
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            media: {
              type: 'array',
              description: 'An array of artifacts to uplaod',
              items: {
                type: 'object',
                required: ['file_name', 'encoded_file'],
                properties: {
                  file_name: {
                    type: 'string',
                    description: 'The name of the file'
                  },
                  encoded_file: {
                    type: 'string',
                    description: 'The base64 encoded file content'
                  }
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Uploads any media in the request to S3, adding their keys to the request, and calling next().
 *
 * Does nothing if no media is present in the request.
 *
 * TODO: make media handling an extension that can be added to different endpoints/record types
 *
 * @returns {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
    const debug_label = 'uploadMedia';

    defaultLog.debug({ label: debug_label, message: 'start:', body: req.body });

    if (!req.body.media || !req.body.media.length) {
      // no media objects included, skipping media upload step
      return next();
    }

    const rawMediaArray: IMediaItem[] = req.body.media;

    const s3UploadPromises: Promise<ManagedUpload.SendData>[] = [];

    rawMediaArray.forEach((rawMedia: IMediaItem) => {
      if (!rawMedia) {
        return;
      }

      let media: MediaBase64;
      try {
        media = new MediaBase64(rawMedia);
      } catch (error) {
        defaultLog.debug({ label: debug_label, message: 'error', error });
        throw {
          status: 400,
          message: 'Included media was invalid/encoded incorrectly'
        };
      }

      const metadata = {
        filename: media.mediaName || '',
        description: media.mediaDescription || '',
        date: media.mediaDate || '',
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      s3UploadPromises.push(uploadFileToS3(media, metadata));

      console.log('--------------- metadata', metadata);
    });

    return res.status(200).json({ upload_status: 'ok' });
  };
}
