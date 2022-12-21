import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get all survey ids for a given project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyIdsSQL = (projectId: number): SQLStatement => {
  return SQL`
    SELECT
      survey_id as id
    FROM
      survey
    WHERE
      project_id = ${projectId};
  `;
};
