import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import {
  projectReportAttachmentAuthorSchema,
  projectReportAttachmentSchema
} from '../../../../../../openapi/schemas/attachment';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/metadata/get');

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
              metadata: projectReportAttachmentSchema,
              authors: {
                type: 'array',
                items: projectReportAttachmentAuthorSchema
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
