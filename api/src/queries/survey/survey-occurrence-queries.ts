import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-occurrence-queries');

/**
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @return {*}  {(SQLStatement | null)}
 */
export const postSurveyOccurrenceSubmissionSQL = (
  surveyId: number,
  source: string,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyOccurrenceSubmissionSQL',
    message: 'params',
    surveyId,
    source,
    key
  });

  if (!surveyId || !source || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO occurrence_submission (
      survey_id,
      source,
      event_timestamp,
      key
    ) VALUES (
      ${surveyId},
      ${source},
      now(),
      ${key}
    );
  `;

  defaultLog.debug({
    label: 'postSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
