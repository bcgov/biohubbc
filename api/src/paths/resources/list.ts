import { Object } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getObjectMeta, listFilesFromS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/resources/list');

const CURRENT_TEMPLATES_PATH = 'templates/Current';

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
                  required: ['url', 'lastModified', 'fileSize', 'metadata'],
                  properties: {
                    url: {
                      type: 'string'
                    },
                    lastModified: {
                      type: 'string'
                    },
                    fileSize: {
                      type: 'number'
                    },
                    metadata: {
                      type: 'object',
                      required: ['templateName', 'templateType'],
                      properties: {
                        species: {
                          type: 'string'
                        },
                        templateName: {
                          type: 'string'
                        },
                        templateType: {
                          type: 'string'
                        }
                      }
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
      const response = await listFilesFromS3(CURRENT_TEMPLATES_PATH);

      /**
       * Filters directories from the list files response, then maps them to an array of promises
       * which fetch the metadata for each object in the list.
       */
      const filePromises = (response?.Contents || [])
        .filter((file: Object) => !file.Key?.endsWith('/'))
        .map(async (file: Object) => {
          let metadata = {};

          if (file.Key) {
            const metaResponse = await getObjectMeta(file.Key);

            metadata = {
              species: metaResponse?.Metadata?.['species'],
              templateName: metaResponse?.Metadata?.['template-name'],
              templateType: metaResponse?.Metadata?.['template-type']
            }
          }

          return {
            url: file.Key,
            lastModified: file.LastModified,
            fileSize: file.Size,
            metadata
          }
        });

      // Resolve all promises before returning the result
      const files = await Promise.all(filePromises);

      res.status(200).json({ files });
    } catch (error) {
      defaultLog.error({ label: 'listResources', message: 'error', error });
      throw error;
    }
  };
}
