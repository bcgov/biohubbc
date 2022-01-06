import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { GetPublicAttachmentsData } from '../../../../../models/public/project';
import { queries } from '../../../../../queries/queries';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/public/project/{projectId}/attachments/list');

export const GET: Operation = [getPublicProjectAttachments()];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a public (published) project.',
  tags: ['attachments'],
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
      description: 'Public (published) project get response file description array.',
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

export function getPublicProjectAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getAPIUserDBConnection();

    try {
      const getPublicProjectAttachmentsSQLStatement = queries.public.getPublicProjectAttachmentsSQL(
        Number(req.params.projectId)
      );
      const getPublicProjectReportAttachmentsSQLStatement = queries.public.getPublicProjectReportAttachmentsSQL(
        Number(req.params.projectId)
      );

      if (!getPublicProjectAttachmentsSQLStatement || !getPublicProjectReportAttachmentsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const attachmentsData = await connection.query(
        getPublicProjectAttachmentsSQLStatement.text,
        getPublicProjectAttachmentsSQLStatement.values
      );

      const reportAttachmentsData = await connection.query(
        getPublicProjectReportAttachmentsSQLStatement.text,
        getPublicProjectReportAttachmentsSQLStatement.values
      );

      await connection.commit();

      const getAttachmentsData =
        (attachmentsData &&
          reportAttachmentsData &&
          attachmentsData.rows &&
          reportAttachmentsData.rows &&
          new GetPublicAttachmentsData([...attachmentsData.rows, ...reportAttachmentsData.rows])) ||
        null;

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.error({ label: 'getPublicProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
