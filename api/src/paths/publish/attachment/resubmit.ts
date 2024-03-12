import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { GCNotifyService } from '../../../services/gcnotify-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/publish/attachment/resubmit');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.body.projectId),
          discriminator: 'ProjectPermission'
        }
      ]
    };
  }),
  resubmitAttachment()
];

POST.apiDoc = {
  description: 'remove or resubmit attachment data to Biohub.',
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
          required: ['projectId', 'fileName', 'parentName', 'formValues', 'path'],
          properties: {
            projectId: {
              type: 'number',
              minimum: 1
            },
            fileName: {
              type: 'string'
            },
            parentName: {
              type: 'string'
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
            },
            path: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Resubmit OK',
      content: {
        'application/json': {
          schema: {
            title: 'email sent response',
            type: 'boolean'
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

/**
 * Publish project data to Biohub.
 *
 * @return {*}  {RequestHandler}
 */
// @TODO is this endpoint needed anymore? Do we submit attachments on their own?
export function resubmitAttachment(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const resubmitData = req.body;

    try {
      await connection.open();

      const gcNotifyService = new GCNotifyService();

      const response = await gcNotifyService.sendNotificationForResubmit(resubmitData);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'resubmitAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
