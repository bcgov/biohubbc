import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSurveyObject } from '../models/survey';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/survey-queries');

/**
 * SQL query to insert a new survey.
 *
 * @param {PostSurveyObject} survey
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (survey: PostSurveyObject): SQLStatement => {
  defaultLog.debug({ label: 'postSurveySQL', message: 'params', PostSurveyObject });

  if (!survey) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey (
      tags
    ) VALUES (
      ${survey.tags}
    )
    RETURNING
      id,
      tags
  `;

  defaultLog.debug({
    label: 'postSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySQL = (surveyId: number): SQLStatement => {
  defaultLog.debug({ label: 'getSurveySQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      tags
    from
      survey
    where
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
