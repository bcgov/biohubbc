import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../constants/attachments';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/delete');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteAttachment()
];

POST.apiDoc = {
  ...attachmentApiDocObject(
    'Delete an attachment of a project.',
    'Row count of successfully deleted attachment record'
  ),
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
  requestBody: {
    description: 'Current attachment type for project attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['attachmentType', 'securityToken'],
          properties: {
            attachmentType: {
              type: 'string'
            },
            securityToken: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Current attachment type for project attachment deleted'
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

export function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      let deleteResult: { key: string };
      if (req.body.attachmentType === ATTACHMENT_TYPE.REPORT) {
        await attachmentService.removeAllSecurityFromProjectReportAttachment(Number(req.params.attachmentId));

        await attachmentService.deleteProjectReportAttachmentAuthors(Number(req.params.attachmentId));

        deleteResult = await attachmentService.deleteProjectReportAttachment(Number(req.params.attachmentId));
      } else {
        await attachmentService.removeAllSecurityFromProjectAttachment(Number(req.params.attachmentId));
        deleteResult = await attachmentService.deleteProjectAttachment(Number(req.params.attachmentId));
      }

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(deleteResult.key);

      if (!deleteFileResult) {
        return res.status(200).json(null);
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
