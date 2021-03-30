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
 * SQL query to delete project focal species rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteFocalSpeciesSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteFocalSpeciesSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from focal_species
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteFocalSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete project ancillary species rows.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const deleteAncillarySpeciesSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteAncillarySpeciesSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from ancillary_species
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'deleteAncillarySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
