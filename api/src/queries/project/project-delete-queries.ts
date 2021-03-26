import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-delete-queries');

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
      p_id = ${projectId}
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'deleteProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
