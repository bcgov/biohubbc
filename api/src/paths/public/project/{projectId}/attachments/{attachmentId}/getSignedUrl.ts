'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../utils/logger';
import { getAPIUserDBConnection } from '../../../../../../database/db';
import { getS3SignedURL } from '../../../../../../utils/file-utils';
import {
  getPublicProjectAttachmentS3KeySQL,
  getPublicProjectReportAttachmentS3KeySQL
} from '../../../../../../queries/public/project-queries';

const defaultLog = getLogger('/api/public/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const POST: Operation = [getSingleAttachmentURL()];

POST.apiDoc = {
  description: 'Retrieves the signed url of an attachment in a public (published) project by its file name.',
  tags: ['attachment'],
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
  requestBody: {
    description: 'Current attachment type for public (published) project attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Response containing the signed url of an attachment.',
      content: {
        'text/plain': {
          schema: {
            type: 'number'
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

export function getSingleAttachmentURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single attachment url', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body || !req.body.attachmentType) {
      throw new HTTP400('Missing required body param `attachmentType`');
    }

    const connection = getAPIUserDBConnection();

    try {
      const getProjectAttachmentS3KeySQLStatement =
        req.body.attachmentType === 'Report'
          ? getPublicProjectReportAttachmentS3KeySQL(Number(req.params.attachmentId))
          : getPublicProjectAttachmentS3KeySQL(Number(req.params.attachmentId));

      if (!getProjectAttachmentS3KeySQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(
        getProjectAttachmentS3KeySQLStatement.text,
        getProjectAttachmentS3KeySQLStatement.values
      );

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0].key;

      const s3SignedUrl = s3Key && (await getS3SignedURL(s3Key));

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.debug({ label: 'getSingleAttachmentURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
