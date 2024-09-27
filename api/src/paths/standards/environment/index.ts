import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../database/db';
import { EnvironmentStandardsSchema } from '../../../openapi/schemas/standards';
import { StandardsService } from '../../../services/standards-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/projects');

export const GET: Operation = [getEnvironmentStandards()];

GET.apiDoc = {
  description: 'Gets lookup values for environment variables',
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
  responses: {
    200: {
      description: 'Environment data standards response object.',
      content: {
        'application/json': {
          schema: EnvironmentStandardsSchema
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
 * Get environment data standards
 *
 * @returns {RequestHandler}
 */
export function getEnvironmentStandards(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const standardsService = new StandardsService(connection);

      const keyword = (req.query.keyword as string) ?? '';

      const response = await standardsService.getEnvironmentStandards(keyword);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getEnvironmentStandards', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
