import { SQL, SQLStatement } from 'sql-template-strings';
import { PutIUCNData } from '../../models/project-update';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-delete-queries');

/**
 * SQL query to delete project IUCN rows.
 *
 * @param {(PutIUCNData)} iucn
 * @returns {SQLStatement} sql query object
 */
export const deleteIUCNSQL = (projectId: number, iucn: PutIUCNData | null): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteIUCNSQL',
    message: 'params',
    projectId,
    iucn
  });

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
