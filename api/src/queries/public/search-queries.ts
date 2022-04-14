import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get public project geometries
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicSpatialSearchResultsSQL = (): SQLStatement | null => {
  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      public.ST_asGeoJSON(p.geography) as geometry
    from
      project as p
    where
      p.publish_timestamp is not null;
  `;

  return sqlStatement;
};
