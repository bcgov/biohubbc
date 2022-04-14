import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to associate existing non-sampling permits to a project
 *
 * @param {number} permitId
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const associatePermitToProjectSQL = (permitId: number, projectId: number): SQLStatement | null => {
  if (!permitId || !projectId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE permit
    SET
      project_id = ${projectId},
      coordinator_first_name = NULL,
      coordinator_last_name = NULL,
      coordinator_email_address = NULL,
      coordinator_agency_name = NULL
    WHERE
      permit_id = ${permitId};
  `;

  return sqlStatement;
};
