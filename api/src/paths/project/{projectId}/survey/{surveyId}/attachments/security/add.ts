import { RequestHandler } from "express";
import { Operation } from "express-openapi";
import { SYSTEM_ROLE } from "../../../../../../../constants/roles";
import { getDBConnection } from "../../../../../../../database/db";
import { authorizeRequestHandler } from "../../../../../../../request-handlers/security/authorization";
import { AttachmentService, IAttachmentType } from "../../../../../../../services/attachment-service";
import { getLogger } from "../../../../../../../utils/logger";


const defaultLog = getLogger('/api/project/{projectId}/attachments/security/add');

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
  addSurveyAttachmentSecurity()
];

POST.apiDoc = {
  description: 'Adds security rules for one or more attachments.',
  tags: ['attachments', 'security'],
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
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['attachments', 'security_ids'],
          properties: {
            security_ids: {
              type: 'array',
              items: {
                type: 'number',
              }
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'type'],
                properties: {
                  id: {
                    type: 'number'
                  },
                  type: {
                    type: 'string'
                  }
                }
              },
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project get response file description array.',
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['media'],
            properties: {
              media: {
                type: 'string',
                format: 'binary'
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
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function addSurveyAttachmentSecurity(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const securityIds: number[] = req.body.security_ids;
    const attachments: IAttachmentType[] = req.body.attachments;

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      await attachmentService.addSecurityToSurveyAttachments(securityIds,attachments);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
