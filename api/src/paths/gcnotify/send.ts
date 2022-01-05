import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../errors/CustomError';
import { SYSTEM_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';
import axios from 'axios';

const defaultLog = getLogger('paths/gcnotify');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemUser'
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
          required: ['recipientAddress', 'message', 'templateFormat'],
          properties: {
            recipientAddress: {
              type: 'string'
            },
            message: {
              type: 'object',
              required: ['header', 'main_body1', 'main_body2', 'footer'],
              properties: {
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
            },
            templateFormat: {
              type: 'string'
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
            type: 'object'
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
    const recipientAddress = req.body?.recipientAddress || null;
    const message = req.body?.message || null;
    const templateFormat = req.body?.templateFormat || null;

    if (!recipientAddress) {
      throw new HTTP400('Missing required body param: recipientAddress');
    }

    if (!templateFormat) {
      throw new HTTP400('Missing required body param: templateFormat');
    }

    if (!message) {
      throw new HTTP400('Missing required body param: message');
    }

    if (!message.header) {
      throw new HTTP400('Missing required body param: message.header');
    }

    if (!message.main_body1) {
      throw new HTTP400('Missing required body param: message.main_body1');
    }

    if (!message.main_body2) {
      throw new HTTP400('Missing required body param: message.main_body2');
    }

    if (!message.footer) {
      throw new HTTP400('Missing required body param: message.footer');
    }

    const api_key = process.env.GCNOTIFY_SECRET_API_KEY;
    const config = {
      headers: {
        Authorization: api_key,
        'Content-Type': 'application/json'
      }
    };

    if (templateFormat === 'email') {
      const template = process.env.GCNOTIFY_ONBOARDING_REQUEST_EMAIL_TEMPLATE;

      const data = {
        email_address: recipientAddress,
        template_id: template,
        personalisation: {
          header: message.header,
          main_body1: message.main_body1,
          main_body2: message.main_body2,
          footer: message.footer
        }
      };

      try {
        await axios
          .post('https://api.notification.canada.ca/v2/notifications/email', data, config)
          .then((response: any) => {
            console.log(response);
            return res.status(200);
          })
          .catch((error: any) => {
            console.log(error.response.data.errors);
          });
      } catch (error) {
        defaultLog.error({ label: 'send gcNotfiy', message: 'error', error });
        throw error;
      }
    } else if (templateFormat === 'sms') {
      const template = process.env.GCNOTIFY_ONBOARDING_REQUEST_SMS_TEMPLATE;

      const data = {
        phone_number: recipientAddress,
        template_id: template,
        personalisation: {
          header: message.header,
          main_body1: message.main_body1,
          main_body2: message.main_body2,
          footer: message.footer
        }
      };

      try {
        await axios
          .post('https://api.notification.canada.ca/v2/notifications/sms', data, config)
          .then((response: any) => {
            console.log(response);
            return res.status(200);
          })
          .catch((error: any) => {
            console.log(error.response.data.errors);
          });
      } catch (error) {
        defaultLog.error({ label: 'send gcNotfiy', message: 'error', error });
        throw error;
      }
    } else {
      throw new HTTP400('invalid template format given');
    }
  };
}

/*
console.log('//////////////////////////////////////////////');
    console.log(recipientAddress);
    console.log('//////////////////////////////////////////////');
    console.log(JSON.stringify(message));
    console.log('//////////////////////////////////////////////');
    console.log(api_key);
    console.log('//////////////////////////////////////////////');
    */
