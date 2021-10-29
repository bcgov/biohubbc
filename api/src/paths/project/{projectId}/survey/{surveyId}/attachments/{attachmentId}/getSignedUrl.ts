import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../../../constants/attachments';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import {
  getSurveyAttachmentS3KeySQL,
  getSurveyReportAttachmentS3KeySQL
} from '../../../../../../../queries/survey/survey-attachments-queries';
import { getS3SignedURL } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getAttachmentSignedURL()];

GET.apiDoc = {
  description: 'Retrieves the signed url of a survey attachment.',
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

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.query.attachmentType) {
      throw new HTTP400('Missing required query param `attachmentType`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      let s3Key;

      if (req.query.attachmentType === ATTACHMENT_TYPE.REPORT) {
        s3Key = await getSurveyReportAttachmentS3Key(
          Number(req.params.surveyId),
          Number(req.params.attachmentId),
          connection
        );
      } else {
        s3Key = await getSurveyAttachmentS3Key(
          Number(req.params.surveyId),
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

export const getSurveyAttachmentS3Key = async (
  surveyId: number,
  attachmentId: number,
  connection: IDBConnection
): Promise<string> => {
  const sqlStatement = getSurveyAttachmentS3KeySQL(surveyId, attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build attachment S3 key SQLstatement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get attachment S3 key');
  }

  return response.rows[0].key;
};

export const getSurveyReportAttachmentS3Key = async (
  surveyId: number,
  attachmentId: number,
  connection: IDBConnection
): Promise<string> => {
  const sqlStatement = getSurveyReportAttachmentS3KeySQL(surveyId, attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build report attachment S3 key SQLstatement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get attachment S3 key');
  }

  return response.rows[0].key;
};
