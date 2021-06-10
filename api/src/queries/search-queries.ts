import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/search-queries');

/**
 * SQL query to get project, survey, or survey occurrence geometries based on boundary
 *
 * @param {any} filterFields
 * @returns {SQLStatement} sql query object
 */
export const getSpatialSearchResultsSQL = (filterFields: any): SQLStatement | null => {
  defaultLog.debug({ label: 'getSpatialSearchResultsSQL', message: 'params', filterFields });

  if (
    !filterFields ||
    !filterFields.record_type ||
    !filterFields.geometry.length ||
    !filterFields.geometry[0].geometry
  ) {
    return null;
  }

  let sqlStatement;

  if (filterFields.record_type === 'project') {
    sqlStatement = SQL`
      SELECT
        p.id,
        p.name,
        p.objectives,
        public.ST_asGeoJSON(p.geography) as geometry
      from
        project as p
      where
        public.ST_INTERSECTS(
          p.geography,
          public.geography(
            public.ST_Force2D(
              public.ST_SetSRID(
                public.ST_GeomFromGeoJSON(${filterFields.geometry[0].geometry}),
                4326
              )
            )
          )
        )
    `;
  } else if (filterFields.record_type === 'survey') {
    sqlStatement = SQL`
      SELECT
        s.id,
        s.name,
        s.objectives,
        public.ST_asGeoJSON(s.geography) as geometry
      from
        survey as s
      where
        public.ST_INTERSECTS(
          s.geography,
          public.geography(
            public.ST_Force2D(
              public.ST_SetSRID(
                public.ST_GeomFromGeoJSON(${filterFields.geometry[0].geometry}),
                4326
              )
            )
          )
        )
    `;
  } else {
    sqlStatement = SQL`
      SELECT
        so.id,
        so.associatedtaxa,
        so.lifestage,
        public.ST_asGeoJSON(so.geography) as geometry
      from
        survey_occurrence as so
      where
        public.ST_INTERSECTS(
          so.geography,
          public.geography(
            public.ST_Force2D(
              public.ST_SetSRID(
                public.ST_GeomFromGeoJSON(${filterFields.geometry[0].geometry}),
                4326
              )
            )
          )
        )
    `;
  }

  defaultLog.debug({
    label: 'getSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
