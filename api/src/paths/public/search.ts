import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { searchResponseObject } from '../../openapi/schemas/search';
import { queries } from '../../queries/queries';
import { getLogger } from '../../utils/logger';
import { _extractResults } from '../search';

const defaultLog = getLogger('paths/public/search');

export const GET: Operation = [getSearchResults()];

GET.apiDoc = {
  description: 'Gets a list of published project geometries for public view',
  tags: ['projects'],
  responses: {
    200: {
      description: 'Spatial search response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              ...(searchResponseObject as object)
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get search results for public view (spatially based on boundary).
 *
 * @returns {RequestHandler}
 */
export function getSearchResults(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const getSpatialSearchResultsSQLStatement = queries.public.getPublicSpatialSearchResultsSQL();

      if (!getSpatialSearchResultsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(
        getSpatialSearchResultsSQLStatement.text,
        getSpatialSearchResultsSQLStatement.values
      );

      await connection.commit();

      if (!response || !response.rows) {
        return res.status(200).json(null);
      }

      const result: any[] = _extractResults(response.rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
