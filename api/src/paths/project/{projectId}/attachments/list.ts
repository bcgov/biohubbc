'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { GetProjectAttachmentsData } from '../../../../models/project-attachments';
import {
  getProjectAttachmentsSQL,
  getProjectReportAttachmentsSQL
} from '../../../../queries/project/project-attachments-queries';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/list');

export const GET: Operation = [getAttachments()];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a project.',
  tags: ['attachments'],
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
    }
  ],
  responses: {
    200: {
      description: 'Project get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fileName: {
                  description: 'The file name of the attachment',
                  type: 'string'
                },
                lastModified: {
                  description: 'The date the object was last modified',
                  type: 'string'
                }
              }
            }
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

export function getAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectAttachmentsSQLStatement = getProjectAttachmentsSQL(Number(req.params.projectId));
      const getProjectReportAttachmentsSQLStatement = getProjectReportAttachmentsSQL(Number(req.params.projectId));

      if (!getProjectAttachmentsSQLStatement || !getProjectReportAttachmentsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const attachmentsData = await connection.query(
        getProjectAttachmentsSQLStatement.text,
        getProjectAttachmentsSQLStatement.values
      );

      const reportAttachmentsData = await connection.query(
        getProjectReportAttachmentsSQLStatement.text,
        getProjectReportAttachmentsSQLStatement.values
      );

      await connection.commit();

      const getAttachmentsData =
        (attachmentsData &&
          reportAttachmentsData &&
          attachmentsData.rows &&
          reportAttachmentsData.rows &&
          new GetProjectAttachmentsData([...attachmentsData.rows, ...reportAttachmentsData.rows])) ||
        null;

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
