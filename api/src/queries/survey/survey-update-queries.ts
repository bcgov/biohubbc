import { SQL, SQLStatement } from 'sql-template-strings';
import { PutSurveyData } from '../../models/survey-update';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-update-queries');

/**
 * SQL query to update a survey row.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {PutSurveyData} survey
 * @returns {SQLStatement} sql query object
 */
 export const putSurveySQL = (
  projectId: number,
  surveyId: number,
  survey: PutSurveyData | null,
  revision_count: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putSurveySQL',
    message: 'params',
    projectId,
    surveyId,
    survey,
    revision_count
  });

  if (!projectId || !surveyId || !survey) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE survey SET
      name = ${survey.name},
      objectives = ${survey.objectives},
      species = ${survey.species},
      start_date = ${survey.start_date},
      end_date = ${survey.end_date},
      lead_first_name = ${survey.lead_first_name},
      lead_last_name = ${survey.lead_last_name},
      location_name = ${survey.location_name}
    where
      p_id = ${projectId}
    and
      id = ${surveyId}
    and
      revision_count = ${revision_count};
  `;

  defaultLog.debug({
    label: 'putSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
