import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/list');

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
  getAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a project.',
  tags: ['attachments'],
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
    }
  ],
  responses: {
    200: {
      description: 'Project get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['attachmentsList', 'reportAttachmentsList'],
            properties: {
              attachmentsList: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['id', 'fileName', 'fileType', 'lastModified', 'size'],
                  properties: {
                    id: {
                      type: 'number'
                    },
                    fileName: {
                      type: 'string'
                    },
                    fileType: {
                      type: 'string'
                    },
                    lastModified: {
                      type: 'string',
                      nullable: true
                    },
                    size: {
                      type: 'number'
                    }
                  }
                }
              },
              reportAttachmentsList: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['id', 'fileName', 'fileType', 'lastModified', 'size'],
                  properties: {
                    id: {
                      type: 'number'
                    },
                    fileName: {
                      type: 'string'
                    },
                    fileType: {
                      type: 'string'
                    },
                    lastModified: {
                      type: 'string',
                      nullable: true
                    },
                    size: {
                      type: 'number'
                    }
                  }
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

    const connection = getDBConnection(req.keycloak_token);
    const projectId = Number(req.params.projectId);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const attachmentsData = await attachmentService.getProjectAttachments(projectId);
      const reportAttachmentsData = await attachmentService.getProjectReportAttachments(projectId);

      const attachmentsList = attachmentsData.map((attachment) => {
        return {
          id: attachment.project_attachment_id,
          fileName: attachment.file_name,
          fileType: attachment.file_type,
          lastModified: attachment.update_date,
          size: attachment.file_size
        };
      });

      const reportAttachmentsList = reportAttachmentsData.map((attachment) => {
        return {
          id: attachment.project_report_attachment_id,
          fileName: attachment.file_name,
          fileType: ATTACHMENT_TYPE.REPORT,
          lastModified: attachment.last_modified,
          size: attachment.file_size
        };
      });

      await connection.commit();

      return res.status(200).json({
        attachmentsList: attachmentsList,
        reportAttachmentsList: reportAttachmentsList
      });
    } catch (error) {
      defaultLog.error({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
