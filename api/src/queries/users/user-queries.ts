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
      su.id,
      su.user_identifier,
      array_remove(array_agg(sr.id), NULL) AS role_ids,
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
      array_remove(array_agg(sr.id), NULL) AS role_ids,
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
      array_remove(array_agg(sr.id), NULL) AS role_ids,
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

/**
 * SQL query to add a new system user.
 *
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @return {*}  {(SQLStatement | null)}
 */
export const addSystemUserSQL = (userIdentifier: string, identitySource: string): SQLStatement | null => {
  defaultLog.debug({ label: 'addSystemUserSQL', message: 'addSystemUserSQL' });

  if (!userIdentifier || !identitySource) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO system_user (
      uis_id,
      user_identifier,
      record_effective_date
    ) VALUES (
      Select id FROM user_identity_source WHERE name = ${identitySource},
      ${userIdentifier},
      now()
    )
    RETURNING
      uis_id,
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
