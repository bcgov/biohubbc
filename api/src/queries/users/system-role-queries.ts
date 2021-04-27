import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/user/system-role-queries');

/**
 * SQL query to add one or more system roles to a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const postSystemRolesSQL = (userId: number, roleIds: number[]): SQLStatement | null => {
  defaultLog.debug({ label: 'postSystemRolesSQL', message: 'params', userId, roleIds });

  if (!userId || !roleIds?.length) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO system_user_role (
      su_id,
      sr_id
    ) VALUES `;

  roleIds.forEach((roleId, index) => {
    sqlStatement.append(SQL`
      (${userId},${roleId})
    `);

    if (index !== roleIds.length - 1) {
      sqlStatement.append(',');
    }
  });

  sqlStatement.append(';');

  defaultLog.debug({
    label: 'postSystemRolesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to remove one or more system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteSystemRolesSQL = (userId: number, roleIds: string[]): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteSystemRolesSQL', message: 'params', userId, roleIds });

  if (!userId || !roleIds?.length) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      system_user_role
    WHERE
      su_id = ${userId}
    AND
      sr_id IN (
        ${roleIds.join(', ')}
      );
  `;

  sqlStatement.append(';');

  defaultLog.debug({
    label: 'deleteSystemRolesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
