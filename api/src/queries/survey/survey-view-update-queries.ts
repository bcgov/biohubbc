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
      s.survey_id as id,
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
      sfs.project_funding_source_id as pfs_id,
      s.publish_timestamp as publish_date,
      CASE
        WHEN ss.is_focal = TRUE THEN wtu.wldtaxonomic_units_id
      END as focal_species,
      CASE
        WHEN ss.is_focal = FALSE THEN wtu.wldtaxonomic_units_id
      END as ancillary_species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wldtaxonomic_units_id = wtu.wldtaxonomic_units_id
    LEFT OUTER JOIN
      survey as s
    ON
      s.survey_id = ss.survey_id
    LEFT OUTER JOIN
      permit as per
    ON
      per.survey_id = s.survey_id
    LEFT OUTER JOIN
      survey_funding_source as sfs
    ON
      sfs.survey_id = s.survey_id
    WHERE
      s.survey_id = ${surveyId};
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
      sp.survey_proprietor_id as id,
      prt.name as proprietor_type_name,
      prt.proprietor_type_id,
      fn.name as first_nations_name,
      fn.first_nations_id,
      sp.rationale as category_rationale,
      CASE
        WHEN sp.proprietor_name is not null THEN sp.proprietor_name
        WHEN fn.first_nations_id is not null THEN fn.name
      END as proprietor_name,
      sp.disa_required,
      sp.revision_count
    from
      survey_proprietor as sp
    left outer join proprietor_type as prt
      on sp.proprietor_type_id = prt.proprietor_type_id
    left outer join first_nations as fn
      on sp.first_nations_id is not null
      and sp.first_nations_id = fn.first_nations_id
    where
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyProprietorForUpdateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
