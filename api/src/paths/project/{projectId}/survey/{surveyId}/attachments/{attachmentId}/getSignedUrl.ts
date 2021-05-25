'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../utils/logger';
import { getDBConnection } from '../../../../../../../database/db';
import { getSurveyAttachmentS3KeySQL } from '../../../../../../../queries/survey/survey-attachments-queries';
import { getS3SignedURL } from '../../../../../../../utils/file-utils';
import { attachmentApiDocObject } from '../../../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getSingleAttachmentURL()];

GET.apiDoc = {
  ...attachmentApiDocObject(
    'Retrieves the signed url of an attachment in a survey by its file name.',
    'GET response containing the signed url of an attachment.'
  ),
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
      name: 'surveyId',
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
  ]
};

function getSingleAttachmentURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single attachment url', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyAttachmentS3KeySQLStatement = getSurveyAttachmentS3KeySQL(
        Number(req.params.surveyId),
        Number(req.params.attachmentId)
      );

      if (!getSurveyAttachmentS3KeySQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(
        getSurveyAttachmentS3KeySQLStatement.text,
        getSurveyAttachmentS3KeySQLStatement.values
      );

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0]?.key;

      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return null;
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
