import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get project geometries
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getSpatialSearchResultsSQL = (isUserAdmin: boolean, systemUserId: number | null): SQLStatement | null => {
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

  return sqlStatement;
};
