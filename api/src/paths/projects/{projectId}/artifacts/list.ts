'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../constants/roles';
import { HTTP400 } from '../../../../errors/CustomError';
import { getFileListFromS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/list');

export const GET: Operation = [getMediaList()];

GET.apiDoc = {
  description: 'Fetches a list of artifact descriptions in a project.',
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
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Project get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fileName: {
                  description: 'The file name of the artifact',
                  type: 'string'
                },
                lastModified: {
                  description: 'The date the object was last modified',
                  type: 'string'
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

function getMediaList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get artifact list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const ContentsList = await getFileListFromS3(req.params.projectId + '/');

    defaultLog.debug({ label: 'getFileListFromS3:', message: 'Content', ContentsList });

    const fileList: any[] = [];

    if (!ContentsList) {
      throw new HTTP400('Failed to get the content list');
    }

    const contents = ContentsList.Contents;

    contents?.forEach(function (content) {
      const file = {
        fileName: content.Key,
        lastModified: content.LastModified
      };

      fileList.push(file);
    });

    defaultLog.debug({ label: 'getMediaList', message: 'fileList', fileList });

    return res.status(200).json(fileList);
  };
}
