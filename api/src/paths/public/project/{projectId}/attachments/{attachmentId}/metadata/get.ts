import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/custom-error';
import { GetReportAttachmentMetadata } from '../../../../../../../models/project-survey-attachments';
import { queries } from '../../../../../../../queries/queries';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getPublicReportMetaData()];

GET.apiDoc = {
  description: 'Retrieves the report metadata of a project attachment if filetype is Report.',
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
    }
  ],
  responses: {
    200: {
      description: 'Response of the report metadata',
      content: {
        'application/json': {
          schema: {
            title: 'metadata get response object',
            type: 'object',
            required: [
              'attachment_id',
              'title',
              'last_modified',
              'description',
              'year_published',
              'revision_count',
              'authors'
            ],
            properties: {
              attachment_id: {
                description: 'Report metadata attachment id',
                type: 'number'
              },
              title: {
                description: 'Report metadata attachment title ',
                type: 'string'
              },
              last_modified: {
                description: 'Report metadata last modified',
                type: 'string'
              },
              description: {
                description: 'Report metadata description',
                type: 'string'
              },
              year_published: {
                description: 'Report metadata year published',
                type: 'number'
              },
              revision_count: {
                description: 'Report metadata revision count',
                type: 'number'
              },
              authors: {
                description: 'Report metadata author object',
                type: 'array',
                items: {
                  type: 'object',
                  required: ['first_name', 'last_name'],
                  properties: {
                    first_name: {
                      type: 'string'
                    },
                    last_name: {
                      type: 'string'
                    }
                  }
                }
              }
            }
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

export function getPublicReportMetaData(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getSurveyReportMetaData',
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

    const connection = getAPIUserDBConnection();

    try {
      const getPublicProjectReportAttachmentSQLStatement = queries.public.getPublicProjectReportAttachmentSQL(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const getProjectReportAuthorsSQLStatement = queries.public.getProjectReportAuthorsSQL(
        Number(req.params.attachmentId)
      );

      if (!getPublicProjectReportAttachmentSQLStatement || !getProjectReportAuthorsSQLStatement) {
        throw new HTTP400('Failed to build metadata SQLStatement');
      }

      await connection.open();

      const reportMetaData = await connection.query(
        getPublicProjectReportAttachmentSQLStatement.text,
        getPublicProjectReportAttachmentSQLStatement.values
      );

      const reportAuthorsData = await connection.query(
        getProjectReportAuthorsSQLStatement.text,
        getProjectReportAuthorsSQLStatement.values
      );

      await connection.commit();

      const getReportMetaData = reportMetaData && reportMetaData.rows[0];

      const getReportAuthorsData = reportAuthorsData && reportAuthorsData.rows;

      const reportMetaObj = new GetReportAttachmentMetadata(getReportMetaData, getReportAuthorsData);

      console.log('reportMetaObj:', reportMetaObj);

      return res.status(200).json(reportMetaObj);
    } catch (error) {
      defaultLog.error({ label: 'getPublicReportMetadata', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
