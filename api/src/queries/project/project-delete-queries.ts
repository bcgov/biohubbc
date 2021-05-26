import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-delete-queries');

/**
 * SQL query to delete project region rows
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteRegionsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteRegionsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_region
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteRegionsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

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
      p_id = ${projectId};
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
      p_id = ${projectId};
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
      p_id = ${projectId};
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
      p_id = ${projectId};
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
      p_id = ${projectId};
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
export const deleteFundingSourceSQL = (
  projectId: number | undefined,
  pfsId: number | undefined
): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteFundingSourceSQL',
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
      p_id = ${projectId}
    AND
      id = ${pfsId};
  `;

  defaultLog.debug({
    label: 'deleteFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
