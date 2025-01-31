import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { vantageReferenceRecordsSchema } from '../../../openapi/schemas/vantage';
import { VantageService } from '../../../services/vantage-mode-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/reference/get/vantage-mode');

export const GET: Operation = [getVantageReferenceRecords()];

GET.apiDoc = {
  description: 'Find vantage reference records applicable to method lookup ids.',
  tags: ['reference'],
  parameters: [
    {
      in: 'query',
      name: 'methodLookupId',
      schema: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
        minItems: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Vantage reference records for method lookup id.',
      content: {
        'application/json': {
          schema: vantageReferenceRecordsSchema
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
 * Get all vantage reference records for multiple method lookup ids.
 *
 * @returns {RequestHandler}
 */
export function getVantageReferenceRecords(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const methodLookupIds = (req.query.methodLookupId as string[]).map(Number);

      await connection.open();

      const vantageService = new VantageService(connection);

      const response = await vantageService.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getVantages', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
