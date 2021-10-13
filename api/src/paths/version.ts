import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';

export const GET: Operation = [getVersionInformation()];

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
export function getVersionInformation(): RequestHandler {
  return (req, res) => {
    const versionInfo = {
      version: process.env.VERSION,
      environment: process.env.NODE_ENV,
      timezone: process.env.TZ
    };

    res.status(200).json(versionInfo);
  };
}
