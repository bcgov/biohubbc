import winston from 'winston';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { HTTP400 } from '../errors/custom-error';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';

export const GET: Operation = [
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
  updateLoggerLevel()
];

GET.apiDoc = {
  description: "Update the log level for the API's default logger",
  tags: ['misc'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'level',
      schema: {
        description: 'Log levels, from least logging to most logging',
        type: 'string',
        enum: ['silent', 'error', 'warn', 'info', 'debug', 'silly']
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'OK'
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
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get api version information.
 *
 * @returns {RequestHandler}
 */
export function updateLoggerLevel(): RequestHandler {
  return (req, res) => {
    if (!req.query?.level) {
      throw new HTTP400('Missing required query param `level`');
    }

    // Update log level for all registered loggers
    winston.loggers.loggers.forEach((logger) => {
      logger.transports[0].level = req.query?.level as string;
    });

    res.status(200).send();
  };
}
