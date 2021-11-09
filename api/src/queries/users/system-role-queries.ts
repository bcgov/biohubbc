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

/**
 * SQL query to remove one or more system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteSystemRolesSQL = (userId: number, roleIds: number[]): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteSystemRolesSQL', message: 'params', userId, roleIds });

  if (!userId || !roleIds?.length) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      system_user_role
    WHERE
      system_user_id = ${userId}
    AND
      system_role_id IN (`;

  // Add first element
  sqlStatement.append(SQL`${roleIds[0]}`);

  for (let idx = 1; idx < roleIds.length; idx++) {
    // Add subsequent elements, which get a comma prefix
    sqlStatement.append(SQL`, ${roleIds[idx]}`);
  }

  sqlStatement.append(SQL`);`);

  defaultLog.debug({
    label: 'deleteSystemRolesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const postProjectRolesByRoleNameSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectRoleSQL',
    message: 'params',
    projectId,
    systemUserId,
    projectParticipantRole
  });

  if (!projectId || !systemUserId || !projectParticipantRole) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    )
    (
      SELECT
        ${projectId},
        ${systemUserId},
        project_role_id
      FROM
        project_role
      WHERE
        name = ${projectParticipantRole}
    );`;

  defaultLog.info({
    label: 'postProjectRoleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
