import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../constants/attachments';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import {
  getProjectAttachmentS3KeySQL,
  getProjectReportAttachmentS3KeySQL
} from '../../../../../queries/project/project-attachments-queries';
import { getS3SignedURL } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getAttachmentSignedURL()];

GET.apiDoc = {
  description: 'Retrieves the signed url of a project attachment.',
  tags: ['attachment'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
    },
    {
      in: 'query',
      name: 'attachmentType',
      schema: {
        type: 'string',
        enum: ['Report', 'Other']
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Response containing the signed url of an attachment.',
      content: {
        'text/plain': {
          schema: {
            type: 'string'
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getAttachmentSignedURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getAttachmentSignedURL',
      message: 'params',
      req_params: req.params,
      req_query: req.query
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.query.attachmentType) {
      throw new HTTP400('Missing required query param `attachmentType`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      let s3Key;

      if (req.query.attachmentType === ATTACHMENT_TYPE.REPORT) {
        s3Key = await getProjectReportAttachmentS3Key(
          Number(req.params.projectId),
          Number(req.params.attachmentId),
          connection
        );
      } else {
        s3Key = await getProjectAttachmentS3Key(
          Number(req.params.projectId),
          Number(req.params.attachmentId),
          connection
        );
      }

      await connection.commit();

      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.error({ label: 'getAttachmentSignedURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getProjectAttachmentS3Key = async (
  projectId: number,
  attachmentId: number,
  connection: IDBConnection
): Promise<string> => {
  const sqlStatement = getProjectAttachmentS3KeySQL(projectId, attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build attachment S3 key SQLstatement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get attachment S3 key');
  }

  return response.rows[0].key;
};

export const getProjectReportAttachmentS3Key = async (
  projectId: number,
  attachmentId: number,
  connection: IDBConnection
): Promise<string> => {
  const sqlStatement = getProjectReportAttachmentS3KeySQL(projectId, attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build report attachment S3 key SQLstatement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get attachment S3 key');
  }

  return response.rows[0].key;
};
