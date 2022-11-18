import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { GetReportAttachmentMetadata } from '../../../../../../models/project-survey-attachments';
import { queries } from '../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getProjectReportMetaData()
];

GET.apiDoc = {
  description: 'Retrieves the report metadata of a project attachment if filetype is Report.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'integer',
        minimum: 1
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

export function getProjectReportMetaData(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getProjectReportMetaData',
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

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectReportAttachmentSQLStatement = queries.project.getProjectReportAttachmentSQL(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const getProjectReportAuthorsSQLStatement = queries.project.getProjectReportAuthorsSQL(
        Number(req.params.attachmentId)
      );

      if (!getProjectReportAttachmentSQLStatement || !getProjectReportAuthorsSQLStatement) {
        throw new HTTP400('Failed to build metadata SQLStatement');
      }

      await connection.open();

      const reportMetaData = await connection.query(
        getProjectReportAttachmentSQLStatement.text,
        getProjectReportAttachmentSQLStatement.values
      );

      const reportAuthorsData = await connection.query(
        getProjectReportAuthorsSQLStatement.text,
        getProjectReportAuthorsSQLStatement.values
      );

      await connection.commit();

      const getReportMetaData = reportMetaData && reportMetaData.rows[0];

      const getReportAuthorsData = reportAuthorsData && reportAuthorsData.rows;

      const securityObj = [
        {
          security_reason_id: 1,
          category: 'category 1',
          reasonTitle: 'reason title 1',
          reasonDescription: 'reason description 1',
          expirationDate: null
        },
        {
          security_reason_id: 2,
          category: 'category 2',
          reasonTitle: 'reason title 2',
          reasonDescription: 'reason description 2',
          expirationDate: new Date().toISOString()
        }
      ];

      const reportMetaObj = new GetReportAttachmentMetadata(getReportMetaData, getReportAuthorsData, securityObj);
      console.log(reportMetaObj);
      return res.status(200).json(reportMetaObj);
    } catch (error) {
      defaultLog.error({ label: 'getReportMetadata', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
