import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/http-error';
import { GetAttachmentsData } from '../../../../models/project-survey-attachments';
import { IGetProjectAttachment, WithSecurityRuleCount } from '../../../../repositories/attachment-repository';
import { authorizeRequestHandler, userHasValidRole } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { AttachmentStatus } from '../../../../repositories/attachment-repository'
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

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const projectId = Number(req.params.projectId);

    try {
      await connection.open();
      const isUserAdmin = userHasValidRole([SYSTEM_ROLE.DATA_ADMINISTRATOR], req['system_user']['role_names']);

      const attachmentService = new AttachmentService(connection);      
      
      const attachmentsData = (await attachmentService.getProjectAttachmentsWithSecurityCounts(projectId))
        .map(((attachment: WithSecurityRuleCount<IGetProjectAttachment>) => {
          const status: AttachmentStatus = attachment.security_review_timestamp ? (
            attachment.security_rule_count > 0
              ? 'SECURED'
              : 'UNSECURED'
          ) : (
            isUserAdmin
              ? 'PENDING_REVIEW'
              : 'SUBMITTED'
          );

          return { ...attachment, status };
        }))

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
