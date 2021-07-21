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

/**
 * SQL query to get S3 key of a template for a single survey.
 *
 * @param {number} surveyId
 * @param {number} templateId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyTemplateS3KeySQL = (surveyId: number, templateId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyTemplateS3KeySQL', message: 'params', surveyId });

  if (!surveyId || !templateId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      occurrence_submission
    WHERE
      occurrence_submission_id = ${templateId};
  `;

  defaultLog.debug({
    label: 'getSurveyTemplateS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
