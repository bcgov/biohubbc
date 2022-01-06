import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/search/search-queries');

/**
 * SQL query to get project geometries
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getSpatialSearchResultsSQL = (isUserAdmin: boolean, systemUserId: number | null): SQLStatement | null => {
  defaultLog.debug({ label: 'getSpatialSearchResultsSQL', message: 'params', isUserAdmin, systemUserId });

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
  `;

  if (!isUserAdmin) {
    sqlStatement.append(SQL` and p.create_user = ${systemUserId};`);
  } else {
    sqlStatement.append(SQL`;`);
  }

  defaultLog.debug({
    label: 'getSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
