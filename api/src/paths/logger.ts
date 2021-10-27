import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getLogger } from '../utils/logger';

export const GET: Operation = [updateLoggerLevel()];

GET.apiDoc = {
  description: "Update the log level for the API's default logger",
  tags: ['misc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN]
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
      res.status(400).send('Missing required query param `level`');
    }

    // Update default logger log level
    const defaultLog = getLogger('');
    defaultLog.transports[0].level = req.query?.level as string;

    res.status(200).send();
  };
}
