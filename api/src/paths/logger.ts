import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { authorizeRequestHandler } from '../request-handlers/security/authorization';
import { setLogLevel, setLogLevelFile, WinstonLogLevel, WinstonLogLevels } from '../utils/logger';

export const GET: Operation = [
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
  updateLoggerLevel()
];

GET.apiDoc = {
  description: 'Update the logging level of the winston logger.',
  tags: ['misc'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'logLevel',
      description: 'Set the log level for the console transport (non-production environments only)',
      schema: {
        description: 'Log levels, from least logging to most logging',
        type: 'string',
        enum: [...WinstonLogLevels]
      }
    },
    {
      in: 'query',
      name: 'logLevelFile',
      description: 'Set the log level for the file transport',
      schema: {
        description: 'Log levels, from least logging to most logging',
        type: 'string',
        enum: [...WinstonLogLevels]
      }
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
      $ref: '#/components/responses/403'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Update the logging level of the winston logger.
 *
 * @returns {RequestHandler}
 */
export function updateLoggerLevel(): RequestHandler {
  return (req, res) => {
    if (req.query.logLevel) {
      setLogLevel(req.query.loglevel as WinstonLogLevel);
    }

    if (req.query.logLevelFile) {
      setLogLevelFile(req.query.logLevelFile as WinstonLogLevel);
    }

    res.status(200).send();
  };
}
