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
export const postActivitySQL = (activity: PostActivityObject): SQLStatement | null => {
  defaultLog.debug({ label: 'postActivitySQL', message: 'params', PostActivityObject });

  if (!activity) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO activity (
      tags,
      tempalte_id,
      form_data
    ) VALUES (
      ${activity.tags},
      ${activity.template_id},
      ${activity.form_data}
    )
    RETURNING
      id,
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

/**
 * SQL query to get a single activity.
 *
 * @param {number} activityId
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (activityId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getActivitySQL', message: 'params', activityId });

  if (!activityId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      tags
    from
      activity
    where
      id = ${activityId};
  `;

  defaultLog.debug({
    label: 'getActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
