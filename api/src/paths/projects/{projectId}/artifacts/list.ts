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
    defaultLog.debug('started... req.params.projectId=' + req.params.projectId);

    console.log('----------req------------');
    console.log(req);

    defaultLog.debug({ label: 'Get media list', message: 'params',  });

    //defaultLog.debug({ label: 'PostProjectObject', message: 'params', req });

    if (!req.params.projectId) {
      throw {
        status: 400,
        message: 'Missing required path param `projectId`'
      };
    }

    const ContentsList = await getFileListFromS3(req.params.projectId + '/');

    defaultLog.debug({ label: 'getFileListFromS3:', message: 'Content', ContentsList });

    const fileList: any[] = [];

    if(!ContentsList) {
      throw {
        status: 400,
        message: 'Failed to get the content list'
      };
    }

    const contents = ContentsList.Contents;

    contents?.forEach(function (content) {
        const file = {
          fileName: content.Key,
          lastModified: content.LastModified
        };

        fileList.push(file);
      });

      

    defaultLog.debug('fileList: ', fileList);

    return res.status(200).json(fileList);
  };
}
