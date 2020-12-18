import { SQL, SQLStatement } from 'sql-template-strings';
import { PostProjectObject } from '../models/project';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/project-queries');

/**
 * SQL query to insert a new project.
 *
 * @param {PostProjectObject} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (project: PostProjectObject): SQLStatement => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project (
      tags
    ) VALUES (
      ${project.tags}
    )
    RETURNING
      project_id,
      tags
  `;

  defaultLog.debug({
    label: 'postProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a single project.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: string): SQLStatement => {
  defaultLog.debug({ label: 'getProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      project_id,
      tags
    from
      project
    where
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
