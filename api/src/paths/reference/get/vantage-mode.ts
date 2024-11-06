import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { vantageModeSchema } from '../../../openapi/schemas/technique';
import { VantageModeService } from '../../../services/vantage-mode-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reference/get/vantage-mode');

export const GET: Operation = [getVantageModes()];

GET.apiDoc = {
  description: 'Find vantage modes applicable to method lookup options',
  tags: ['reference'],
  parameters: [
    {
      in: 'query',
      name: 'methodLookupId',
      schema: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Vantages for a method lookup id.',
      content: {
        'application/json': {
          schema: vantageModeSchema
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
 * Get all vantage modes possible for multiple method lookup ids.
 *
 * @returns {RequestHandler}
 */
export function getVantageModes(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const methodLookupIds: number[] = (req.query.methodLookupId as string[]).map(Number);

      await connection.open();

      const vantageModeService = new VantageModeService(connection);

      const response = await vantageModeService.getVantageModesByMethodLookupIds(methodLookupIds);

      // Allow browsers to cache this response for 300 seconds (5 minutes)
      res.setHeader('Cache-Control', 'private, max-age=300');

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getVantageModes', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
