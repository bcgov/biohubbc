import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import { searchResponseObject } from '../openapi/schemas/search';
import { queries } from '../queries/queries';
import { authorizeRequestHandler, userHasValidRole } from '../request-handlers/security/authorization';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths/search');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getSearchResults()
];

GET.apiDoc = {
  description: 'Gets a list of published project geometries for given systemUserId',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
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
 * Get search results by system user id (spatially based on boundary).
 *
 * @returns {RequestHandler}
 */
export function getSearchResults(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();
      const isUserAdmin = userHasValidRole([SYSTEM_ROLE.SYSTEM_ADMIN], req['system_user']['role_names']);

      const getSpatialSearchResultsSQLStatement = queries.search.getSpatialSearchResultsSQL(isUserAdmin, systemUserId);

      if (!getSpatialSearchResultsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

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
