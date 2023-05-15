import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/publish/attachment/resubmit');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  resubmitAttachment()
];

POST.apiDoc = {
  description: 'Delete or resubmit attachment data to Biohub.',
  tags: ['attachment', 'biohub'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'attachment submission file to delete or resubmit',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['file', 'formValues'],
          properties: {
            file: {
              required: ['id', 'fileName', 'fileType', 'size', 'lastModified', 'supplementaryAttachmentData'],
              properties: {
                id: {
                  type: 'integer'
                },
                fileName: {
                  type: 'string'
                },
                fileType: {
                  type: 'string'
                },
                size: {
                  type: 'integer'
                },
                lastModified: {
                  type: 'string'
                },
                supplementaryAttachmentData: {
                  type: 'object',
                  nullable: true,
                  properties: {}
                }
              }
            },
            formValues: {
              required: ['full_name', 'email_address', 'phone_number', 'description'],
              properties: {
                full_name: {
                  type: 'string'
                },
                email_address: {
                  type: 'string'
                },
                phone_number: {
                  type: 'string'
                },
                description: {
                  type: 'string'
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
      description: 'Upload OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'string'
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

/**
 * Publish project data to Biohub.
 *
 * @return {*}  {RequestHandler}
 */
export function resubmitAttachment(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const attachmentData = req.body;
    console.log('attachmentData', attachmentData);

    try {
      await connection.open();

      await connection.commit();

      return res.status(200).json({ data: 'ok' });
    } catch (error) {
      defaultLog.error({ label: 'publishProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
