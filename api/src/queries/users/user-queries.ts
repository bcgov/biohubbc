import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/user/user-queries');

/**
 * SQL query to get a single user and their system roles, based on their user_identifier.
 *
 * // TODO SQL needs finalizing/optimizing
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
      su.id,
      su.user_identifier,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.id = sur.su_id
    LEFT JOIN
      system_role sr
    ON
      sur.sr_id = sr.id
    WHERE
      su.user_identifier = ${userIdentifier}
    GROUP BY
      su.id,
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
 * // TODO SQL needs finalizing/optimizing
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
      su.id,
      su.user_identifier,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.id = sur.su_id
    LEFT JOIN
      system_role sr
    ON
      sur.sr_id = sr.id
    WHERE
      su.id = ${userId}
    GROUP BY
      su.id,
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
      su.id,
      su.user_identifier,
      array_agg(sr.name) as role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.id = sur.su_id
    LEFT JOIN
      system_role sr
    ON
      sur.sr_id = sr.id
    GROUP BY
      su.id,
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
