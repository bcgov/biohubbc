'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { deleteSurveyAttachmentSQL } from '../../../../../../../queries/survey/survey-attachments-queries';
import { deleteFileFromS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/delete');

export const DELETE: Operation = [deleteAttachment()];

DELETE.apiDoc = {
  ...attachmentApiDocObject('Delete an attachment of a survey.', 'Row count of successfully deleted attachment record'),
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

export function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const deleteSurveyAttachmentSQLStatement = deleteSurveyAttachmentSQL(
        Number(req.params.surveyId),
        Number(req.params.attachmentId)
      );

      if (!deleteSurveyAttachmentSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const result = await connection.query(
        deleteSurveyAttachmentSQLStatement.text,
        deleteSurveyAttachmentSQLStatement.values
      );
      const s3Key = result && result.rows.length && result.rows[0].key;

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(s3Key);

      if (!deleteFileResult) {
        return res.status(200).json(null);
      }

      return res.status(200).json(result && result.rowCount);
    } catch (error) {
      defaultLog.debug({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
