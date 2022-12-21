import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { GetAttachmentsData } from '../../../../models/project-survey-attachments';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/list');

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
            properties: {
              attachmentsList: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'fileName', 'fileType', 'lastModified', 'securityToken', 'size'],
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
                      type: 'string'
                    },
                    securityToken: {
                      description: 'The security token of the attachment',
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

    const connection = getDBConnection(req['keycloak_token']);
    const projectId = Number(req.params.projectId);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const attachmentsData = await attachmentService.getProjectAttachments(projectId);
      const reportAttachmentsData = await attachmentService.getProjectReportAttachments(projectId);

      await connection.commit();

      const getAttachmentsData = new GetAttachmentsData(attachmentsData, reportAttachmentsData);

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.error({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
