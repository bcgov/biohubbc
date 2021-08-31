import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-delete-queries');

/**
 * SQL query to delete project indigenous partnership rows (project_first_nations)
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteIndigenousPartnershipsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteIndigenousPartnershipsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_first_nation
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteIndigenousPartnershipsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete permit rows associated to a project
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deletePermitSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deletePermitSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from permit
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deletePermitSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete project stakeholder partnership rows
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteStakeholderPartnershipsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteStakeholderPartnershipsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from stakeholder_partnership
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteStakeholderPartnershipsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete project IUCN rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteIUCNSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteIUCNSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_iucn_action_classification
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete project activity rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteActivitiesSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteActivitiesSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE FROM
      project_activity
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteActivitiesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

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
  defaultLog.debug({
    label: 'deleteProjectFundingSourceSQL',
    message: 'params',
    projectId,
    pfsId
  });

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

  defaultLog.debug({
    label: 'deleteProjectFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a project row (and associated data) based on project ID.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteProjectSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`call api_delete_project(${projectId})`;

  defaultLog.debug({
    label: 'deleteProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
