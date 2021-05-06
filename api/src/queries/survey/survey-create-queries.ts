import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';
import { PostSurveyObject, PostSurveyProprietorData } from '../../models/survey-create';

const defaultLog = getLogger('queries/survey/user-queries');

/**
 * SQL query to insert a survey row.
 *
 * @param {number} projectId
 * @param {PostSurveyObject} survey
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (projectId: number, survey: PostSurveyObject): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveySQL',
    message: 'params',
    projectId,
    survey
  });

  if (!projectId || !survey) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  INSERT INTO survey (
    p_id, name, objectives, species, start_date, end_date, lead_first_name, lead_last_name, location_name
  ) VALUES (
    ${projectId},
    ${survey.survey_name},
    ${survey.survey_purpose},
    ${survey.species},
    ${survey.start_date},
    ${survey.end_date},
    ${survey.biologist_first_name},
    ${survey.biologist_last_name},
    ${survey.survey_area_name}
  )
  RETURNING
    id;
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
 * SQL query to insert a survey_proprietor row.
 *
 * @param {number} surveyId
 * @param {PostSurveyProprietorData} surveyProprietor
 * @returns {SQLStatement} sql query object
 */
export const postSurveyProprietorSQL = (
  surveyId: number,
  surveyProprietor: PostSurveyProprietorData
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyProprietorSQL',
    message: 'params',
    surveyId,
    surveyProprietor
  });

  if (!surveyId || !surveyProprietor) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  INSERT INTO survey_proprietor (
    s_id, prt_id, fn_id, rationale, proprietor_name, disa_required
  ) VALUES (
    ${surveyId},
    ${surveyProprietor.prt_id},
    ${surveyProprietor.fn_id},
    ${surveyProprietor.rationale},
    ${surveyProprietor.proprietor_name},
    ${surveyProprietor.disa_required}
  )
  RETURNING
    id;
`;

  defaultLog.debug({
    label: 'postSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
