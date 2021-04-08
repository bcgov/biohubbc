'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../../constants/roles';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getLogger } from '../../../../../utils/logger';
import { getDBConnection } from '../../../../../database/db';
import { getProjectAttachmentS3KeySQL } from '../../../../../queries/project/project-attachments-queries';
import { getS3SignedURL } from '../../../../../utils/file-utils';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/attachments/{attachmentId}/view');

export const GET: Operation = [getSingleAttachmentURL()];

GET.apiDoc = {
  description: 'Retrieves the signed url of an attachment in a project by its file name.',
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
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'GET response containing the signed url of an attachment.',
      content: {
        'text/plain': {
          schema: {
            type: 'string'
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

function getSingleAttachmentURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single attachment url', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectAttachmentS3KeySQLStatement = getProjectAttachmentS3KeySQL(Number(req.params.projectId), Number(req.params.attachmentId));

      if (!getProjectAttachmentS3KeySQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(getProjectAttachmentS3KeySQLStatement.text, getProjectAttachmentS3KeySQLStatement.values);

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0]?.key;

      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return null;
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.debug({ label: 'getSingleAttachmentURL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
