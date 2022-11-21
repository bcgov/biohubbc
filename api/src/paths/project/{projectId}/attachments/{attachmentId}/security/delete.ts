import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/security/delete');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteProjectSecurityReasons()
];

POST.apiDoc = {
  description: 'Delete security reason on attachment of a project.',
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Row count of successfully deleted security reason',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['security_ids', 'attachmentType'],
          properties: {
            security_ids: {
              type: 'array',
              items: {
                type: 'number',
                minimum: 1
              }
            },
            attachmentType: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Attachment Security rules removed'
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

export function deleteProjectSecurityReasons(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete Project Security Reasons', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    const attachmentId = Number(req.params.attachmentId);
    const securityIds: number[] = req.body.security_ids;
    const attachmentType = req.body.attachmentType;

    try {
      await connection.open();
      const attachmentService = new AttachmentService(connection);

      if (attachmentType == 'Report') {
        await attachmentService.removeSecurityFromProjectReportAttachment(securityIds, attachmentId);
      } else {
        await attachmentService.removeSecurityFromProjectAttachment(securityIds, attachmentId);
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteProjectSecurityReasons', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
