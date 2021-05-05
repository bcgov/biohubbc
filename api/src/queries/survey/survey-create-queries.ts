import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';
import { PostSurveyData } from '../../models/survey-create';

const defaultLog = getLogger('queries/survey/user-queries');

/**
 * SQL query to insert a project activity row.
 *
 * @param projectId
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (projectId: number, survey: PostSurveyData): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyData',
    message: 'params',
    projectId
  });

  if (!projectId) {
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
    label: 'postSurveyActivity',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

// /**
//  * SQL query to insert a project funding source row.
//  *
//  * @param {PostFundingSource} fundingSource
//  * @returns {SQLStatement} sql query object
//  */
//  export const postProjectFundingSourceSQL = (
//   fundingSource: PostFundingSource,
//   projectId: number
// ): SQLStatement | null => {
//   defaultLog.debug({ label: 'postProjectFundingSourceSQL', message: 'params', fundingSource, projectId });

//   if (!fundingSource || !projectId) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`
//       INSERT INTO project_funding_source (
//         p_id,
//         iac_id,
//         funding_source_project_id,
//         funding_amount,
//         funding_start_date,
//         funding_end_date
//       ) VALUES (
//         ${projectId},
//         ${fundingSource.investment_action_category},
//         ${fundingSource.agency_project_id},
//         ${fundingSource.funding_amount},
//         ${fundingSource.start_date},
//         ${fundingSource.end_date}
//       )
//       RETURNING
//         id;
//     `;

//   defaultLog.debug({
//     label: 'postProjectFundingSourceSQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };
