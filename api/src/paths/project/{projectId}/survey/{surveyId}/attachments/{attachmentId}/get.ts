import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import { SecuritySearchService } from '../../../../../../../services/security-search-service';
import { getLogger } from '../../../../../../../utils/logger';

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
  getSurveyAttachmentDetails()
];

GET.apiDoc = {
  description: 'Retrieves the survey details of a project attachment if filetype is Report.',
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
            required: ['security_reasons'],
            properties: {
              security_reasons: {
                description: 'Report metadata security object',
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    project_report_author_id: {
                      type: 'number'
                    },
                    project_report_attachment_id: {
                      type: 'number'
                    },
                    persecution_security_id: {
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

export function getSurveyAttachmentDetails(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getSurveyAttachmentDetails',
      message: 'params',
      req_params: req.params,
      req_query: req.query
    });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const surveyAttachmentSecurity = await attachmentService.getSurveyAttachmentSecurityReasons(
        Number(req.params.attachmentId)
      );

      const securitySearchService = new SecuritySearchService();

      const persecutionRules = await securitySearchService.getPersecutionSecurityRules();

      await connection.commit();

      const mappedSecurityObj = surveyAttachmentSecurity.map((item) => {
        return {
          security_reason_id: item.persecution_security_id,
          security_reason_title: persecutionRules[item.persecution_security_id - 1].reasonTitle,
          security_reason_description: persecutionRules[item.persecution_security_id - 1].reasonDescription,
          user_identifier: item.user_identifier,
          security_date_applied: item.create_date
        };
      });

      const attachmentDetails = {
        security_reasons: mappedSecurityObj
      };

      return res.status(200).json(attachmentDetails);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachmentDetails', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
