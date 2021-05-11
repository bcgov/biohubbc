import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

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
      fn.name as first_nations_name,
      rationale,
      proprietor_name,
      disa_required
    from
      survey_proprietor as sp
    left outer join proprietor_type as prt
      on sp.prt_id = prt.id
    left outer join first_nations as fn
      on sp.fn_id = fn.id
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

/**
 * SQL query to get all surveys.
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
      id,
      name,
      species,
      start_date,
      end_date
    from
      survey
    where
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
