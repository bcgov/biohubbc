import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

/**
 * SQL query to retrieve a survey row.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyDetailsSQL = (projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyDetailsSQL',
    message: 'params',
    projectId,
    surveyId
  });

  if (!projectId || !surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      name,
      objectives,
      species,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      location_name,
      public.ST_asGeoJSON(geography) as geometry,
      revision_count
    from
      survey
    where
      p_id = ${projectId}
    and
      id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyDetailsSQL',
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
export const getSurveyProprietorSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyProprietorSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      prt.name as proprietor_type_name,
      prt.id as proprietor_type_id,
      fn.name as first_nations_name,
      fn.id as first_nations_id,
      sp.rationale,
      sp.proprietor_name,
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
    label: 'getSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
