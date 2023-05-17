import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { GCNotifyService, IgcNotifyRequestRemovalMessage } from '../../../services/gcnotify-service';
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
          required: ['fileName', 'formValues', 'path'],
          properties: {
            fileName: {
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
      description: 'Upload OK',
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

    const resubmitData = req.body;
    const url = `${process.env.APP_HOST}/login?redirect=${encodeURIComponent(resubmitData.path)}`;
    const hrefUrl = `[click here.](${url})`;

    const message: IgcNotifyRequestRemovalMessage = {
      subject: '',
      header: '',
      date: new Date().toLocaleString(),
      file_name: resubmitData.fileName,
      link: hrefUrl,
      description: resubmitData.formValues.description,
      full_name: resubmitData.formValues.full_name,
      email: resubmitData.formValues.email_address,
      phone: resubmitData.formValues.phone_number
    };

    const submitterMessage: IgcNotifyRequestRemovalMessage = {
      ...message,
      subject: 'Species Inventory Management System - Your Request to Remove or Resubmit Has Been Sent',
      header: `Your request to remove or resubmit data has been sent.

      A BioHub Administrator should be in contact with you shortly to discuss your request.`
    };

    const adminEmail = process.env.GCNOTIFY_ADMIN_EMAIL || '';
    const adminMessage: IgcNotifyRequestRemovalMessage = {
      ...message,
      subject: 'Species Inventory Management System -  Request to Remove or Resubmit',
      header: ''
    };

    try {
      await connection.open();

      const gcNotifyService = new GCNotifyService();
      const responseUser = await gcNotifyService.requestRemovalEmailNotification(
        resubmitData.formValues.email_address,
        submitterMessage
      );
      const responseAdmin = await gcNotifyService.requestRemovalEmailNotification(adminEmail, adminMessage);

      await connection.commit();

      return res.status(200).json(responseUser.id && responseAdmin.id && true);
    } catch (error) {
      defaultLog.error({ label: 'publishProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
