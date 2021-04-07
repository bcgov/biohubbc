'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { deleteProjectAttachmentSQL } from '../../../../../../queries/project/project-attachments-queries';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/attachments/{attachmentId}/delete');

export const DELETE: Operation = [deleteAttachment()];

DELETE.apiDoc = {
  description: 'Delete an attachment of a project.',
  tags: ['attachment'],
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
      description: 'Row count of successfully deleted attachment record',
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
      const deleteProjectAttachmentSQLStatement = deleteProjectAttachmentSQL(Number(req.params.projectId), Number(req.params.attachmentId));

      if (!deleteProjectAttachmentSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.open();

      const result = await connection.query(deleteProjectAttachmentSQLStatement.text, deleteProjectAttachmentSQLStatement.values);

      // delete from s3 here

      await connection.commit();

      return res.status(200).json(result && result.rowCount);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectAttachments', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
