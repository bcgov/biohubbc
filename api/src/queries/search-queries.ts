import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/search-queries');

/**
 * SQL query to get project geometries
 * TODO: be modified to restrict based on published state and geo boundary
 *
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getSpatialSearchResultsSQL = (systemUserId: number | null): SQLStatement | null => {
  defaultLog.debug({ label: 'getSpatialSearchResultsSQL', message: 'params', systemUserId });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      public.ST_asGeoJSON(p.geography) as geometry
    from
      project as p
    where
      p.publish_timestamp is not null
    and
      p.create_user = ${systemUserId};
  `;

  defaultLog.debug({
    label: 'getSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
