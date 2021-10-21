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
    GROUP BY
      su.system_user_id,
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
 * SQL to fetch the owner of a specified project.
 *
 * @param {number} projectId
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectOwner = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectOwner', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.create_user
    FROM
      project p;
  `;

  defaultLog.debug({
    label: 'getProjectOwner',
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
    GROUP BY
      su.system_user_id,
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
 * @param {number} systemUserId
 * @return {*}  {(SQLStatement | null)}
 */
export const addSystemUserSQL = (
  userIdentifier: string,
  identitySource: string,
  systemUserId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'addSystemUserSQL',
    message: 'addSystemUserSQL',
    userIdentifier,
    identitySource,
    systemUserId
  });

  if (!userIdentifier || !identitySource || !systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO system_user (
      user_identity_source_id,
      user_identifier,
      record_effective_date,
      create_user
    ) VALUES (
      (Select user_identity_source_id FROM user_identity_source WHERE name = ${identitySource.toUpperCase()}),
      ${userIdentifier},
      now(),
      ${systemUserId}
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
