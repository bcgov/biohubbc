import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import { searchResponseObject } from '../openapi/schemas/search';
import { getLogger } from '../utils/logger';
import { logRequest } from '../utils/path-utils';
import { getSpatialSearchResultsSQL } from '../queries/search-queries';
import { geoJsonFeature } from '../openapi/schemas/geojson-feature';

const defaultLog = getLogger('paths/searchString');

export const POST: Operation = [logRequest('paths/search', 'POST'), getSearchResults()];

POST.apiDoc = {
  description: 'Gets a list of project, survey, and survey occurrence geometries based on a spatial boundary',
  tags: ['projects', 'surveys'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Spatial boundary geometry',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            record_type: {
              title: 'Record Type',
              type: 'string'
            },
            geometry: {
              title: 'Geometry boundary',
              type: 'array',
              items: {
                ...(geoJsonFeature as any)
              }
            }
          }
        }
      }
    }
  },
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
 * Get search results (spatially based on boundary).
 *
 * @returns {RequestHandler}
 */
function getSearchResults(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const filterFields = req.body || null;

    try {
      const getSpatialSearchResultsSQLStatement = getSpatialSearchResultsSQL(filterFields);

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
      defaultLog.debug({ label: 'getSearchResults', message: 'error', error });
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
      objectives: row.objectives,
      lifestage: row.lifestage,
      associatedtaxa: row.associatedtaxa,
      geometry: row.geometry && [JSON.parse(row.geometry)]
    };

    searchResults.push(result);
  });

  return searchResults;
}
