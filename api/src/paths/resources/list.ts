import { Object } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { listFilesFromS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/resources/list');

export const GET: Operation = [listResources()];

GET.apiDoc = {
  description: 'Lists all resources.',
  tags: ['resources'],
  responses: {
    200: {
      description: 'Resources response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              files: {
                type: 'array', 
                items: {
                  type: 'object',
                  required: ['key', 'last_modified'],
                  properties: {
                    key: {
                      type: 'string'
                    },
                    last_modified: {
                      // type: 'string' // @TODO
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    400: {
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
 * List resources.
 *
 * @returns {RequestHandler}
 */
export function listResources(): RequestHandler {
  return async (_req, res) => {
    defaultLog.debug({ label: 'listResources' });

    try {
      const response = await listFilesFromS3('templates/Current');

      const files = response?.Contents?.map((file: Object) => {
        return {
          key: file.Key,
          last_modified: file.LastModified
        }
      }) || [];

      res.status(200).json({ files });
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    }
  };
}
