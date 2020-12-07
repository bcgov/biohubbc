import { SQL, SQLStatement } from 'sql-template-strings';
import { PostActivityObject } from '../models/activity';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/activity-queries');

/**
 * SQL query to insert a new activity.
 *
 * @param {PostActivityObject} activity
 * @returns {SQLStatement} sql query object
 */
export const postActivitySQL = (activity: PostActivityObject): SQLStatement => {
  defaultLog.debug({ label: 'postActivitySQL', message: 'params', PostActivityObject });

  if (!activity) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO activity (
      tags,
      template_id,
      form_data
    ) VALUES (
      ${activity.tags},
      ${activity.template_id},
      ${activity.form_data}
    )
    RETURNING
      tags,
      template_id,
      form_data;
  `;

  defaultLog.debug({
    label: 'postActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
