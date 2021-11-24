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
      system_user_id,
      system_role_id
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
