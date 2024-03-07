import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getProjectReportDetails()
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
            additionalProperties: false,
            required: ['metadata', 'authors'],
            properties: {
              metadata: {
                description: 'Report metadata general information object',
                type: 'object',
                additionalProperties: false,
                required: [
                  'project_report_attachment_id',
                  'title',
                  'last_modified',
                  'description',
                  'year_published',
                  'revision_count'
                ],
                properties: {
                  project_report_attachment_id: {
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
                  additionalProperties: false,
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

export function getProjectReportDetails(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getProjectReportDetails',
      message: 'params',
      req_params: req.params,
      req_query: req.query
    });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const projectReportAttachment = await attachmentService.getProjectReportAttachmentById(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const projectReportAuthors = await attachmentService.getProjectReportAttachmentAuthors(
        Number(req.params.attachmentId)
      );

      await connection.commit();

      const reportDetails = {
        metadata: projectReportAttachment,
        authors: projectReportAuthors
      };

      return res.status(200).json(reportDetails);
    } catch (error) {
      defaultLog.error({ label: 'getProjectReportDetails', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
