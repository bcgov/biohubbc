import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { logRequest } from '../utils/path-utils';

export const GET: Operation = [logRequest('paths/version', 'GET'), getVersionInformation()];

GET.apiDoc = {
  description: 'Get API information',
  tags: ['misc'],
  responses: {
    200: {
      description: 'API information',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              version: {
                description: 'API Version',
                type: 'number'
              },
              environment: {
                description: 'API Environment',
                type: 'string'
              }
            }
          }
        }
      }
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
function getVersionInformation(): RequestHandler {
  return (req, res) => {
    const versionInfo = {
      version: process.env.VERSION,
      environment: process.env.NODE_ENV
    };

    res.status(200).json(versionInfo);
  };
}
