import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

/**
 * SQL query to retrieve a survey row for update purposes.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyDetailsForUpdateSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyDetailsForUpdateSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.id,
      s.name,
      s.objectives,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      public.ST_asGeoJSON(s.geography) as geometry,
      s.revision_count,
      per.number,
      per.type,
      s.publish_timestamp as publish_date,
      CASE
        WHEN ss.is_focal = TRUE THEN wtu.id
      END as focal_species,
      CASE
        WHEN ss.is_focal = FALSE THEN wtu.id
      END as ancillary_species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wu_id = wtu.id
    LEFT OUTER JOIN
      survey as s
    ON
      s.id = ss.s_id
    LEFT OUTER JOIN
      permit as per
    ON
      per.s_id = s.id
    WHERE
      s.id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyDetailsForUpdateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to retrieve a survey_proprietor row.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyProprietorForUpdateSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyProprietorForUpdateSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sp.id,
      prt.name as proprietor_type_name,
      prt.id as proprietor_type_id,
      fn.name as first_nations_name,
      fn.id as first_nations_id,
      sp.rationale as category_rationale,
      CASE
        WHEN sp.proprietor_name is not null THEN sp.proprietor_name
        WHEN fn.id is not null THEN fn.name
      END as proprietor_name,
      sp.disa_required,
      sp.revision_count
    from
      survey_proprietor as sp
    left outer join proprietor_type as prt
      on sp.prt_id = prt.id
    left outer join first_nations as fn
      on sp.fn_id is not null
      and sp.fn_id = fn.id
    where
      s_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyProprietorForUpdateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
