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
export const getSurveySQL = (projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveySQL',
    message: 'params',
    projectId,
    surveyId
  });

  if (!projectId || !surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name,
      objectives,
      species,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      location_name,
      revision_count
    from
      survey
    where
      p_id = ${projectId}
    and
      id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
