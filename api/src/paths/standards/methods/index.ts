import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { MethodStandardSchema } from '../../../openapi/schemas/standards';
import { StandardsService } from '../../../services/standards-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/standards/methods');

export const GET: Operation = [getMethodStandards()];

GET.apiDoc = {
  description: 'Gets lookup values for method variables',
  tags: ['standards'],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    }
  ],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Method data standards response object.',
      content: {
        'application/json': {
          schema: MethodStandardSchema
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
 * Get species data standards
 *
 * @returns {RequestHandler}
 */
export function getMethodStandards(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const standardsService = new StandardsService(connection);

      const keyword = (req.query.keyword as string) ?? '';

      const response = await standardsService.getMethodStandards(keyword);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getMethodStandards', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
