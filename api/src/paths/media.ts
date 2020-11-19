'use strict';

import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { IMediaItem } from '../models/activity';
import { ALL_ROLES } from '../constants/misc';
import { getFileFromS3 } from '../utils/file-utils';

/**
 * GET api/media?key=123;key=456;key=789
 */
export const GET: Operation = [getMedia()];

GET.apiDoc = {
  description: 'Fetches a signed url for a single media item based on its key.',
  tags: ['media'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'key',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                // Don't specify exact response, as it will vary, and is not currently enforced anyways
                // Eventually this could be updated to be a oneOf list, similar to the Post request below.
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

function getMedia(): RequestHandler {
  return async (req, res, next) => {
    const keys = req.query.key as string[];

    if (!keys || !keys.length) {
      // No media keys found, skipping get media step
      return next();
    }

    const s3GetPromises: Promise<GetObjectOutput>[] = [];

    keys.forEach((key: string) => {
      s3GetPromises.push(getFileFromS3(key));
    });

    const response = await Promise.all(s3GetPromises);

    const mediaItems: IMediaItem[] = response.map((s3Object: GetObjectOutput) => {
      // Encode image buffer as base64
      const contentString = Buffer.from(s3Object.Body).toString('base64');

      // Append DATA Url string
      const encodedFile = `data:${s3Object.ContentType};base64,${contentString}`;

      const mediaItem: IMediaItem = {
        file_name: (s3Object && s3Object.Metadata && s3Object.Metadata.filename) || null,
        encoded_file: encodedFile,
        description: (s3Object && s3Object.Metadata && s3Object.Metadata.description) || null,
        media_date: (s3Object && s3Object.Metadata && s3Object.Metadata.date) || null
      };

      return mediaItem;
    });

    return res.status(200).json(mediaItems);
  };
}
