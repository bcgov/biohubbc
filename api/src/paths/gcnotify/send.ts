import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { GCNotifyService, IgcNotifyPostReturn } from '../../services/gcnotify-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/gcnotify');

const APP_HOST = process.env.APP_HOST;

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
  sendNotification()
];

POST.apiDoc = {
  description: 'Send notification to defined recipient',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Send notification to given recipient',
    content: {
      'application/json': {
        schema: {
          title: 'User Response Object',
          type: 'object',
          required: ['recipient', 'message'],
          properties: {
            recipient: {
              type: 'object',
              required: ['emailAddress', 'userId'],
              properties: {
                emailAddress: {
                  type: 'string'
                },
                phoneNumber: {
                  type: 'string'
                },
                userId: {
                  type: 'number'
                }
              }
            },
            message: {
              type: 'object',
              required: ['subject', 'header', 'main_body1', 'main_body2', 'footer'],
              properties: {
                subject: {
                  type: 'string'
                },
                header: {
                  type: 'string'
                },
                main_body1: {
                  type: 'string'
                },
                main_body2: {
                  type: 'string'
                },
                footer: {
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
      description: 'GC Notify Response',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object',
            properties: {
              content: {
                type: 'object'
              },
              id: {
                type: 'string'
              },
              reference: {
                type: 'string',
                nullable: true
              },
              scheduled_for: {
                type: 'string',
                nullable: true
              },
              template: {
                type: 'object'
              },
              uri: {
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
 * Send Notification to a recipient.
 *
 * @returns {RequestHandler}
 */
export function sendNotification(): RequestHandler {
  return async (req, res) => {
    const recipient = req.body?.recipient || null;
    const message = { ...req.body?.message, footer: `To access the site, [${APP_HOST}](${APP_HOST})` } || null;

    try {
      const gcnotifyService = new GCNotifyService();
      let response = {} as IgcNotifyPostReturn;

      if (recipient.emailAddress) {
        response = await gcnotifyService.sendEmailGCNotification(recipient.emailAddress, message);
      }

      if (recipient.phoneNumber) {
        response = await gcnotifyService.sendPhoneNumberGCNotification(recipient.phoneNumber, message);
      }

      //TODO: send an email or sms depending on users ID and data
      // if (recipient.userId) {
      //   defaultLog.error({ label: 'send gcnotify', message: 'email and sms from Id not implemented yet' });
      // }

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'send gcnotify', message: 'error', error });
      throw error;
    }
  };
}
