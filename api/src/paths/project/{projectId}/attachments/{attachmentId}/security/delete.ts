import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/security/delete');

export interface IGetSecurityReasons {
  category: string;
  sub_category: string;
  reason: string;
  reason_description: string;
  date_expired: string;
}

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
  deleteAttachmentSecurity()
];

POST.apiDoc = {
  ...attachmentApiDocObject(
    'Delete security rules on attachment of a project.',
    'Row count of successfully deleted attachment record'
  ),
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
    description: 'Attachment security rules for removal',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['attachmentType'],
          properties: {
            securityReasons: {
              type: 'array',
              items: {
                type: 'object',
                required: ['category', 'sub_category', 'reason', 'reason_description', 'date_expired'],
                properties: {
                  category: {
                    type: 'string'
                  },
                  sub_category: {
                    type: 'string'
                  },
                  reason: {
                    type: 'string'
                  },
                  reason_description: {
                    type: 'string'
                  },
                  date_expired: {
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

export function deleteAttachmentSecurity(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment security', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    const securityReasons: IGetSecurityReasons = req.body.securityReasons;

    console.log('securityReasons', securityReasons);

    try {
      await connection.open();

      await connection.commit();

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
