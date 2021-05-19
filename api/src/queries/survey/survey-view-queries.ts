import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

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
