import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
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
            required: ['metadata', 'authors'],
            properties: {
              metadata: {
                description: 'Report metadata general information object',
                type: 'object',
                required: [
                  'attachment_id',
                  'title',
                  'last_modified',
                  'description',
                  'year_published',
                  'revision_count'
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
                  }
                }
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
              },
              security: {
                description: 'Report metadata security object',
                type: 'array',
                items: {
                  type: 'object'
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
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const projectReportAttachment = await attachmentService.getProjectReportAttachment(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const projectReportAuthors = await attachmentService.getProjectAttachmentAuthors(Number(req.params.attachmentId));

      await connection.commit();

      const securityObj = [
        {
          category: 'my category 1',
          sub_category: 'my sub_category 1',
          reason: 'my_reason 1',
          reason_description: 'This is the description reason for reason 1',
          date_expired: '2020-12-12'
        },
        {
          category: 'my category 2',
          sub_category: 'my sub_category 2',
          reason: 'my_reason 2',
          reason_description: 'This is the description reason for reason 2',
          date_expired: '2040-12-31'
        }
      ];

      const reportMetaObj = { metadata: projectReportAttachment, authors: projectReportAuthors, security: securityObj };

      console.log('*************************** reportMetaObj *****************************');
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
