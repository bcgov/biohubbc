'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { WRITE_ROLES } from '../../../../../constants/roles';
import { getFileFromS3 } from '../../../../../utils/file-utils';
import { IMediaItem } from '../../../../../models/media';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/{fileName}/download');

export const GET: Operation = [getMediaList()];

GET.apiDoc = {
  description: 'Retrieves the content of an artifact in a project by its file name.',
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
    },
    {
      in: 'path',
      name: 'fileName',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'GET response containing the content of an artifact.',
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
              },
              required: ['mediaKey']
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
    defaultLog.debug('started... req.params.projectId=' + req.params.projectId + ', req.params.fileName=' + req.params.fileName);
    
    if (!req.params.projectId) {
      throw {
        status: 400,
        message: 'Missing required path param `projectId`'
      };
    }

    if (!req.params.fileName) {
      throw {
        status: 400,
        message: 'Missing required path param `fileName`'
      };
    }    

    const s3Object: GetObjectOutput = await getFileFromS3(req.params.projectId + '/' + req.params.fileName);

    let artifact: IMediaItem = {
      file_name: '',
      encoded_file: ''
    };

    if (s3Object) {
      artifact = {
        file_name: req.params.fileName,
        encoded_file: 'data:' + s3Object.ContentType + ';base64,' + 'tbd'
      }
    }

    return res.status(200).json({ s3Objeect: s3Object, artifact: artifact });
  };
}
