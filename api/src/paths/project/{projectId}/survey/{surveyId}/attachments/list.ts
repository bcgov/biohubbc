import { AttachmentStatus } from 'aws-sdk/clients/ec2';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { GetAttachmentsData } from '../../../../../../models/project-survey-attachments';
import { IGetSurveyAttachment, IGetSurveyReportAttachment, WithSecurityRuleCount } from '../../../../../../repositories/attachment-repository';
import { authorizeRequestHandler, userHasValidRole } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/list');

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
  getSurveyAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a survey.',
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
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['attachmentsList'],
            properties: {
              attachmentsList: {
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

export function getSurveyAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();
      const isUserAdmin = userHasValidRole([SYSTEM_ROLE.DATA_ADMINISTRATOR], req['system_user']['role_names']);

      const attachmentService = new AttachmentService(connection);

      const attachmentsData = await attachmentService.getSurveyAttachmentsWithSecurityCounts(surveyId);
      const reportAttachmentsData = await attachmentService.getSurveyReportAttachmentsWithSecurityCounts(surveyId);

      const injectAttachmentStatus = (
        attachment: WithSecurityRuleCount<IGetSurveyAttachment | IGetSurveyReportAttachment>
      ) => {
        const status: AttachmentStatus = attachment.security_review_timestamp
          ? attachment.security_rule_count > 0
            ? 'SECURED'
            : 'UNSECURED'
          : isUserAdmin
          ? 'PENDING_REVIEW'
          : 'SUBMITTED';

        return { ...attachment, status };
      };

      await connection.commit();

      const getAttachmentsData = new GetAttachmentsData(
        attachmentsData.map(injectAttachmentStatus),
        reportAttachmentsData.map(injectAttachmentStatus)
      );

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
