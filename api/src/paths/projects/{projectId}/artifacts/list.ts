'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../constants/roles';
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getMediaList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug('started... req.params.projectId=' + req.params.projectId);

    if (!req.params.projectId) {
      throw {
        status: 400,
        message: 'Missing required path param `projectId`'
      };
    }

    const { Contents } = await getFileListFromS3(req.params.projectId + '/');

    defaultLog.debug('Contents:', Contents);

    const fileList: any[] = [];

    if (Contents) {
      Contents.forEach(function (content: any) {
        const file = {
          fileName: content.Key,
          lastModified: content.LastModified
        };

        fileList.push(file);
      });
    }

    defaultLog.debug('fileList: ', fileList);

    return res.status(200).json(fileList);
  };
}
