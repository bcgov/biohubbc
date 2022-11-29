import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { SecuritySearchService } from '../../../../../../services/security-search-service';
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
            required: ['metadata', 'authors', 'security_reasons'],
            properties: {
              metadata: {
                description: 'Report metadata general information object',
                type: 'object',
                required: ['id', 'title', 'last_modified', 'description', 'year_published', 'revision_count'],
                properties: {
                  id: {
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

export function getProjectReportDetails(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getProjectReportDetails',
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

      const projectReportAttachment = await attachmentService.getProjectReportAttachmentById(
        Number(req.params.projectId),
        Number(req.params.attachmentId)
      );

      const projectReportAuthors = await attachmentService.getProjectAttachmentAuthors(Number(req.params.attachmentId));

      const projectReportSecurity = await attachmentService.getProjectReportAttachmentSecurityReasons(
        Number(req.params.attachmentId)
      );

      const securitySearchService = new SecuritySearchService();

      const persecutionRules = await securitySearchService.getPersecutionSecurityRules();

      await connection.commit();

      const mappedSecurityObj = projectReportSecurity.map((item) => {
        return {
          security_reason_id: item.persecution_security_id,
          security_reason_title: persecutionRules[item.persecution_security_id - 1].reasonTitle,
          security_reason_description: persecutionRules[item.persecution_security_id - 1].reasonDescription,
          date_expired: persecutionRules[item.persecution_security_id - 1].expirationDate,
          user_identifier: item.user_identifier,
          security_date_applied: item.create_date
        };
      });

      const reportDetails = {
        metadata: projectReportAttachment,
        authors: projectReportAuthors,
        security_reasons: mappedSecurityObj
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
