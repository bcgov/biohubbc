'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import {
  removeProjectAttachmentSecurityTokenSQL,
  removeSecurityRecordSQL
} from '../../../../../queries/project/project-attachments-queries';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/makePublic');

export const PUT: Operation = [makeProjectAttachmentPublic()];

PUT.apiDoc = {
  description: 'Make visibility of a project attachment public.',
  tags: ['attachment', 'visibility'],
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
    }
  ],
  requestBody: {
    description: 'Current security token value for project attachment.',
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
      description: 'Project attachment make public visibility response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of record for which visibility has been made public',
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

export function makeProjectAttachmentPublic(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Make visibility of a project attachment public',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body) {
      throw new HTTP400('Missing required request body');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Step 1: Remove associated row from the security table
      const removeSecurityRecordSQLStatement = removeSecurityRecordSQL(req.body.securityToken);

      if (!removeSecurityRecordSQLStatement) {
        throw new HTTP400('Failed to build SQL remove security record statement');
      }

      const removeSecurityRecordSQLResponse = await connection.query(
        removeSecurityRecordSQLStatement.text,
        removeSecurityRecordSQLStatement.values
      );

      if (!removeSecurityRecordSQLResponse || !removeSecurityRecordSQLResponse.rowCount) {
        throw new HTTP400('Failed to remove security record');
      }

      // Step 2: Remove security token from project attachment row
      const removeProjectAttachmentSecurityTokenSQLStatement = removeProjectAttachmentSecurityTokenSQL(
        Number(req.params.attachmentId)
      );

      if (!removeProjectAttachmentSecurityTokenSQLStatement) {
        throw new HTTP400('Failed to build SQL remove project attachment security token statement');
      }

      const removeProjectAttachmentSecurityTokenSQLResponse = await connection.query(
        removeProjectAttachmentSecurityTokenSQLStatement.text,
        removeProjectAttachmentSecurityTokenSQLStatement.values
      );

      if (
        !removeProjectAttachmentSecurityTokenSQLResponse ||
        !removeProjectAttachmentSecurityTokenSQLResponse.rowCount
      ) {
        throw new HTTP400('Failed to remove project attachment security token');
      }

      await connection.commit();

      return res.status(200).json(1);
    } catch (error) {
      defaultLog.debug({ label: 'makeProjectAttachmentPublic', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
