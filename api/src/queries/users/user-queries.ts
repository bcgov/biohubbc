import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get a single user and their system roles, based on their user_identifier.
 *
 * @param {string} userIdentifier
 * @returns {SQLStatement} sql query object
 */
export const getUserByUserIdentifierSQL = (userIdentifier: string): SQLStatement | null => {
  if (!userIdentifier) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      su.system_user_id,
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

  return sqlStatement;
};

/**
 * SQL query to get a single user and their system roles, based on their id.
 *
 * @param {number} userId
 * @returns {SQLStatement} sql query object
 */
export const getUserByIdSQL = (userId: number): SQLStatement | null => {
  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      su.system_user_id,
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

  return sqlStatement;
};

/**
 * SQL query to get all users.
 *
 * @returns {SQLStatement} sql query object
 */
export const getUserListSQL = (): SQLStatement | null => {
  const sqlStatement = SQL`
    SELECT
      su.system_user_id,
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
      *;
  `;

  return sqlStatement;
};

/**
 * SQL query to remove one or more system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deactivateSystemUserSQL = (userId: number): SQLStatement | null => {
  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      system_user
    SET
      record_end_date = now()
    WHERE
      system_user_id = ${userId}
    RETURNING
      *;
  `;

  return sqlStatement;
};

/**
 * SQL query to activate a system user. Does nothing is the system user is already active.
 *
 * @param {number} userId
 * @return {*}  {(SQLStatement | null)}
 */
export const activateSystemUserSQL = (userId: number): SQLStatement | null => {
  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      system_user
    SET
      record_end_date = NULL
    WHERE
      system_user_id = ${userId}
    RETURNING
      *;
  `;

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
  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      system_user_role
    WHERE
      system_user_id = ${userId}
    RETURNING
      *;
  `;

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
  if (!userId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      system_user_id = ${userId}
    RETURNING
      *;
  `;

  return sqlStatement;
};
