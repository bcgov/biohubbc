import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../errors/custom-error';
import { SYSTEM_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';
import { GCNotifyService } from '../../services/gcnotify-service';
import { IgcNotifyPostReturn } from '../../models/gcnotify';

const defaultLog = getLogger('paths/gcnotify');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
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
              required: ['header', 'body1', 'body2', 'footer'],
              properties: {
                header: {
                  type: 'string'
                },
                body1: {
                  type: 'string'
                },
                body2: {
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
                type: 'string'
              },
              scheduled_for: {
                type: 'string'
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
 * Send Notification to a recipient.
 *
 * @returns {RequestHandler}
 */
export function sendNotification(): RequestHandler {
  return async (req, res) => {
    const recipient = req.body?.recipient || null;
    const message = req.body?.message || null;

    if (!req.body) {
      throw new HTTP400('Missing required param: body');
    }

    if (!recipient) {
      throw new HTTP400('Missing required body param: recipient');
    }

    if (!message) {
      throw new HTTP400('Missing required body param: message');
    }

    if (!message.header) {
      throw new HTTP400('Missing required body param: message.header');
    }

    if (!message.body1) {
      throw new HTTP400('Missing required body param: message.body1');
    }

    if (!message.body2) {
      throw new HTTP400('Missing required body param: message.body2');
    }

    if (!message.footer) {
      throw new HTTP400('Missing required body param: message.footer');
    }

    try {
      const gcnotifyService = new GCNotifyService();
      let response = {} as IgcNotifyPostReturn;

      if (recipient.emailAddress) {
        response = await gcnotifyService.sendEmailGCNotification(recipient.emailAddress, message);
      }

      if (recipient.phoneNumber) {
        response = await gcnotifyService.sendPhoneNumberGCNotification(recipient.phoneNumber, message);
      }

      if (recipient.userId) {
        defaultLog.error({ label: 'send gcnotify', message: 'email and sms from Id not implemented yet' });
      }

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'send gcnotify', message: 'error', error });
      throw error;
    }
  };
}
