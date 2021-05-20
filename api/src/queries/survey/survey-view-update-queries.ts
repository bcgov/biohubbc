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
    label: 'getSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
