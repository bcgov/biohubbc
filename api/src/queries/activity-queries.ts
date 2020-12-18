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
      activity_id,
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
 * @param {string} activityId
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (activityId: string): SQLStatement => {
  defaultLog.debug({ label: 'getActivitySQL', message: 'params', activityId });

  if (!activityId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      activity_id,
      tags
    from
      activity
    where
      activity_id = ${activityId};
  `;

  defaultLog.debug({
    label: 'getActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
