import { Object as S3Object } from 'aws-sdk/clients/s3';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getObjectMeta, getS3HostUrl, listFilesFromS3 } from '../../utils/file-utils';
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
            additionalProperties: false,
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['fileName', 'url', 'lastModified', 'fileSize', 'metadata'],
                  properties: {
                    fileName: {
                      type: 'string'
                    },
                    url: {
                      type: 'string'
                    },
                    lastModified: {
                      oneOf: [{ type: 'string', format: 'date' }, { type: 'object' }]
                    },
                    fileSize: {
                      type: 'number'
                    },
                    metadata: {
                      type: 'object',
                      additionalProperties: false,
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
        .filter((file: S3Object) => !file.Key?.endsWith('/'))
        .map(async (file: S3Object) => {
          let metadata = {};
          let fileName = '';

          if (file.Key) {
            const metaResponse = await getObjectMeta(file.Key);

            // Trim path name and/or leading '/' character(s)
            fileName = file.Key.replace(new RegExp(`^${CURRENT_TEMPLATES_PATH}/*`), '');

            metadata = {
              species: metaResponse?.Metadata?.['species'],
              templateName: metaResponse?.Metadata?.['template-name'],
              templateType: metaResponse?.Metadata?.['template-type']
            };
          }

          return {
            fileName,
            url: getS3HostUrl(file.Key),
            lastModified: file.LastModified?.toISOString() || null,
            fileSize: file.Size,
            metadata
          };
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
