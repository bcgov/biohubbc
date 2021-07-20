import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-attachments-queries');

/**
 * SQL query to get attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getTemplateObservationsSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getTemplateObservationsSQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      occurrence_submission_id as id,
      update_date,
      create_date,
      key
    from
      occurrence_submission
    where
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getTemplateObservationsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
