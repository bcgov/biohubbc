import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/user/user-queries');

/**
 * SQL query to get a single user and their system roles, based on their user_identifier.
 *
 * @param {string} userIdentifier
 * @returns {SQLStatement} sql query object
 */
export const getUserByUserIdentifierSQL = (userIdentifier: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getUserByUserIdentifierSQL', message: 'params', userIdentifier });

  if (!userIdentifier) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      su.system_user_id as id,
      su.user_identifier,
      su.record_end_date,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    WHERE
      su.user_identifier = ${userIdentifier}
    GROUP BY
      su.system_user_id,
      su.record_end_date,
      su.user_identifier;
  `;

  defaultLog.debug({
    label: 'getUserByUserIdentifierSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a single user and their system roles, based on their id.
 *
 * @param {number} userId
 * @returns {SQLStatement} sql query object
 */
export const getUserByIdSQL = (userId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getUserByIdSQL', message: 'params', userId });

  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      su.system_user_id as id,
      su.user_identifier,
      su.record_end_date,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    WHERE
      su.system_user_id = ${userId}
    AND
      su.record_end_date IS NULL
    GROUP BY
      su.system_user_id,
      su.record_end_date,
      su.user_identifier;
  `;

  defaultLog.debug({
    label: 'getUserByIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all users.
 *
 * @returns {SQLStatement} sql query object
 */
export const getUserListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getUserListSQL', message: 'getUserListSQL' });

  const sqlStatement = SQL`
    SELECT
      su.system_user_id as id,
      su.user_identifier,
      su.record_end_date,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    WHERE
      su.record_end_date IS NULL
    GROUP BY
      su.system_user_id,
      su.record_end_date,
      su.user_identifier;
  `;

  defaultLog.debug({
    label: 'getUserListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a new system user.
 *
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @return {*}  {(SQLStatement | null)}
 */
export const addSystemUserSQL = (userIdentifier: string, identitySource: string): SQLStatement | null => {
  defaultLog.debug({
    label: 'addSystemUserSQL',
    message: 'addSystemUserSQL',
    userIdentifier,
    identitySource
  });

  if (!userIdentifier || !identitySource) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO system_user (
      user_identity_source_id,
      user_identifier,
      record_effective_date
    ) VALUES (
      (Select user_identity_source_id FROM user_identity_source WHERE name = ${identitySource.toUpperCase()}),
      ${userIdentifier},
      now()
    )
    RETURNING
      system_user_id as id,
      user_identity_source_id,
      user_identifier,
      record_effective_date;
  `;

  defaultLog.debug({
    label: 'addSystemUserSQL',
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
export const deActivateSystemUserSQL = (userId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deActivateSystemUserSQL', message: 'params' });

  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      system_user
    SET
      record_end_date = now()
    WHERE
      system_user_id = ${userId};
    `;

  defaultLog.debug({
    label: 'deleteSystemUserSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to activate a system user. Does nothing is the system user is already active.
 *
 * @param {number} systemUserId
 * @return {*}  {(SQLStatement | null)}
 */
export const activateSystemUserSQL = (systemUserId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'activateSystemUserSQL',
    message: 'activateSystemUserSQL',
    systemUserId
  });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      system_user
    SET
      record_end_date = NULL
    WHERE
      system_user_id = ${systemUserId}
    AND
      record_end_date IS NOT NULL
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'activateSystemUserSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to remove all system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteAllSystemRolesSQL = (userId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteAllSystemRolesSQL', message: 'params' });

  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      system_user_role
    WHERE
      system_user_id = ${userId};
    `;

  defaultLog.debug({
    label: 'deleteAllSystemRolesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to remove all system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteAllProjectRolesSQL = (userId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteAllProjectRolesSQL', message: 'params' });

  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      system_user_id = ${userId};
    `;

  defaultLog.debug({
    label: 'deleteAllProjectRolesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
