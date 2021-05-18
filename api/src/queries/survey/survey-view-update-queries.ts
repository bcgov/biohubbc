import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

/**
 * SQL query to retrieve a survey row for viewing purposes.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyForViewSQL = (projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyForViewSQL',
    message: 'params',
    projectId,
    surveyId
  });

  if (!projectId || !surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
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
        WHEN wtu.english_name IS NULL THEN wtu.unit_name2
        ELSE CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
      END as species
    FROM
      wldtaxonomic_units as wtu
    left outer join study_species as ss
    on ss.wu_id = wtu.id
    left outer join survey as s
    on s.id = ss.s_id
    where
      s.p_id = ${projectId}
    and
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

/**
 * SQL query to retrieve a survey row for update purposes.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyForUpdateSQL = (projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyForUpdateSQL',
    message: 'params',
    projectId,
    surveyId
  });

  if (!projectId || !surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
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
        WHEN ss.is_focal is TRUE wtu.id
      END as focal_species,
      CASE
        WHEN ss.is_focal is FALSE wtu.id
      END as ancillary_species,
    FROM
      wldtaxonomic_units as wtu
    left outer join study_species as ss
    on ss.wu_id = wtu.id
    left outer join survey as s
    on s.id = ss.s_id
    where
      s.p_id = ${projectId}
    and
      s.id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyForUpdateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project focal species for update purposes.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
 export const getFocalSpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFocalSpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      wtu.id as id,
      CASE
        WHEN wtu.english_name IS NULL THEN wtu.unit_name2
        ELSE CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
      END as name
    FROM
      wldtaxonomic_units as wtu
    left outer join
      study_species ss
    on
      ss.wu_id = wtu.id
    WHERE
      wtu.tty_name = 'SPECIES'
    AND
      ss.is_focal
    AND
      ss.p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getFocalSpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project ancillary species for update purposes.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAncillarySpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getAncillarySpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      wtu.id as id,
      CASE
        WHEN wtu.english_name IS NULL THEN wtu.unit_name2
        ELSE CONCAT(wtu.english_name, ' - ', wtu.unit_name2)
      END as name
    FROM
      wldtaxonomic_units as wtu
    left outer join
      study_species ss
    on
      ss.wu_id = wtu.id
    WHERE
      wtu.tty_name = 'SPECIES'
    AND
      ss.is_focal is false
    AND
      ss.p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getAncillarySpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
