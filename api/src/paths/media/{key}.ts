'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../constants/misc';
import { getS3SignedURL } from '../../utils/file-utils';

export const GET: Operation = [getSignedURL()];

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
      in: 'path',
      name: 'key',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Activity get response object array.',
      content: {
        'text/plain': {
          schema: {
            type: 'string',
            description: 'A signed url'
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

function getSignedURL(): RequestHandler {
  return async (req, res, next) => {
    if (!req.params.key) {
      throw {
        status: 400,
        message: 'Missing required path param `key`'
      };
    }

    const result = await getS3SignedURL(req.params.key);

    return res.status(200).json(result);
  };
}
