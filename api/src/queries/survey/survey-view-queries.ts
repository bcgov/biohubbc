import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

/**
 * SQL query to get all survey ids for a given project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyIdsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id
    FROM
      survey
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all surveys for list view.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyListSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.id,
      s.name,
      s.start_date,
      s.end_date,
      CASE
        WHEN wtu.english_name IS NULL THEN wtu.unit_name2
        ELSE CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
      END as species
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
    WHERE
      s.p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to retrieve a survey row for viewing purposes.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyForViewSQL',
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
      CASE
        WHEN wtu.english_name IS NULL and ss.is_focal = TRUE THEN wtu.unit_name2
        WHEN wtu.english_name IS NOT NULL and ss.is_focal = TRUE THEN CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
      END as focal_species,
      CASE
        WHEN wtu.english_name IS NULL and ss.is_focal = FALSE THEN wtu.unit_name2
        WHEN wtu.english_name IS NOT NULL and ss.is_focal = FALSE THEN CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
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
    WHERE
      s.id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
