import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL, { SQLStatement } from 'sql-template-strings';
import { SYSTEM_ROLE } from '../constants/roles';
import { getDBConnection } from '../database/db';
import { searchResponseObject } from '../openapi/schemas/search';
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
  description: 'Gets a list of project geometries for given systemUserId',
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
      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );

      const getSpatialSearchResultsSQLStatement = getSpatialSearchResultsSQL(isUserAdmin, systemUserId);

      const response = await connection.sql(getSpatialSearchResultsSQLStatement);

      await connection.commit();

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
 * SQL query to get project geometries
 *
 * @param {boolean} isUserAdmin
 * @param {(number | null)} systemUserId
 * @returns {SQLStatement} sql query object
 */
export function getSpatialSearchResultsSQL(isUserAdmin: boolean, systemUserId: number | null): SQLStatement {
  const sqlStatement = SQL`
      SELECT
        p.project_id as id,
        p.name,
        public.ST_asGeoJSON(p.geography) as geometry
      from
        project as p
    `;

  if (!isUserAdmin) {
    sqlStatement.append(SQL`WHERE p.create_user = ${systemUserId};`);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
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
