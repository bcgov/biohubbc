import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-attachments-queries');

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      file_name,
      update_date
    from
      project_attachment
    where
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
