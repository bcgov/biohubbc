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
      *
    from
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.id = sur.su_id
    LEFT JOIN
      system_role sr
    ON
      sur.sr_id = sr.id
    where
      su.user_identifier = ${userIdentifier};
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
      *
    from
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.id = sur.su_id
    LEFT JOIN
      system_role sr
    ON
      sur.sr_id = sr.id
    where
      su.id = ${userId};
  `;

  defaultLog.debug({
    label: 'getUserByIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
