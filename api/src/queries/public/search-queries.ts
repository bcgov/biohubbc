import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/public/search-queries');

/**
 * SQL query to get public project geometries
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicSpatialSearchResultsSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicSpatialSearchResultsSQL', message: 'params' });

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

  defaultLog.debug({
    label: 'getPublicSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
