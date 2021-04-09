'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/CustomError';
import { GetAttachmentsData } from '../../../../models/project-attachments';
import { getProjectAttachmentsSQL } from '../../../../queries/project/project-attachments-queries';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/projects/{projectId}/artifacts/attachments/view');

export const GET: Operation = [getAttachments()];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a project.',
  tags: ['attachments'],
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

function getAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectAttachmentsSQLStatement = getProjectAttachmentsSQL(Number(req.params.projectId));

      if (!getProjectAttachmentsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const attachmentsData = await connection.query(
        getProjectAttachmentsSQLStatement.text,
        getProjectAttachmentsSQLStatement.values
      );

      await connection.commit();

      const getAttachmentsData =
        (attachmentsData && attachmentsData.rows && new GetAttachmentsData(attachmentsData.rows)) || null;

      defaultLog.debug('Attachments Data:', getAttachmentsData);

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.debug({ label: 'getProjectAttachments', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
