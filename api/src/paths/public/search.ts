import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { searchResponseObject } from '../../openapi/schemas/search';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';
import { getPublicSpatialSearchResultsSQL } from '../../queries/public/search-queries';

const defaultLog = getLogger('paths/public/search');

export const GET: Operation = [logRequest('paths/search', 'GET'), getSearchResults()];

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
      const getSpatialSearchResultsSQLStatement = getPublicSpatialSearchResultsSQL();

      if (!getSpatialSearchResultsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(
        getSpatialSearchResultsSQLStatement.text,
        getSpatialSearchResultsSQLStatement.values
      );

      await connection.commit();

      let rows: any[] = [];

      if (response && response.rows) {
        rows = response.rows;
      }

      const result: any[] = _extractResults(rows);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getSearchResults', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Extract an array of search result data from DB query.
 *
 * @export
 * @param {any[]} rows DB query result rows
 * @return {any[]} An array of search result data
 */
export function _extractResults(rows: any[]): any[] {
  if (!rows || !rows.length) {
    return [];
  }

  const searchResults: any[] = [];

  rows.forEach((row) => {
    const result: any = {
      id: row.id,
      name: row.name,
      geometry: row.geometry && [JSON.parse(row.geometry)]
    };

    searchResults.push(result);
  });

  return searchResults;
}
