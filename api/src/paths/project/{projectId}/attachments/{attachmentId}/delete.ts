'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { deleteProjectAttachmentSQL } from '../../../../../queries/project/project-attachments-queries';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/delete');

export const DELETE: Operation = [deleteAttachment()];

DELETE.apiDoc = attachmentApiDocObject(
  'Delete an attachment of a project.',
  'Row count of successfully deleted attachment record'
);

function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const deleteProjectAttachmentSQLStatement = deleteProjectAttachmentSQL(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      if (!deleteProjectAttachmentSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const result = await connection.query(
        deleteProjectAttachmentSQLStatement.text,
        deleteProjectAttachmentSQLStatement.values
      );
      const s3Key = result && result.rows.length && result.rows[0]?.key;

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(s3Key);

      if (!deleteFileResult) {
        return null;
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
