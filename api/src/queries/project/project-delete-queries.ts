import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to delete project indigenous partnership rows (project_first_nations)
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteIndigenousPartnershipsSQL = (projectId: number): SQLStatement | null => {


  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_first_nation
    WHERE
      project_id = ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to delete permit rows associated to a project
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deletePermitSQL = (projectId: number): SQLStatement | null => {

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from permit
    WHERE
      project_id = ${projectId};
  `;


  return sqlStatement;
};

/**
 * SQL query to delete project stakeholder partnership rows
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteStakeholderPartnershipsSQL = (projectId: number): SQLStatement | null => {


  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from stakeholder_partnership
    WHERE
      project_id = ${projectId};
  `;


  return sqlStatement;
};

/**
 * SQL query to delete project IUCN rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteIUCNSQL = (projectId: number): SQLStatement | null => {


  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_iucn_action_classification
    WHERE
      project_id = ${projectId};
  `;



  return sqlStatement;
};

/**
 * SQL query to delete project activity rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteActivitiesSQL = (projectId: number): SQLStatement | null => {


  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE FROM
      project_activity
    WHERE
      project_id = ${projectId};
  `;


  return sqlStatement;
};

/**
 * SQL query to delete the specific project funding source record.
 *
 * @param {projectId} projectId
 * @param {pfsId} pfsId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectFundingSourceSQL = (
  projectId: number | undefined,
  pfsId: number | undefined
): SQLStatement | null => {


  if (!projectId || !pfsId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_funding_source
    WHERE
      project_id = ${projectId}
    AND
      project_funding_source_id = ${pfsId};
  `;



  return sqlStatement;
};

/**
 * SQL query to delete a project row (and associated data) based on project ID.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectSQL = (projectId: number): SQLStatement | null => {


  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`call api_delete_project(${projectId})`;


  return sqlStatement;
};
