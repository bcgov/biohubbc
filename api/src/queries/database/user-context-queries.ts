import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';

/**
 * Returns an SQL query for setting the user's context. As a side-effect, it first updates the user's
 * `user_guid` to reflect the given `userGuid` value, but only if it is currently `null` (which happens
 * when new system users are created and a GUID is not provided).
 * 
 * @param {string} userGuid the GUID of the user
 * @param {string} userIdentifier the user's identifier
 * @param {string} systemUserType The user type
 * @returns {*} {SQLStatement | null} The SQL statement for setting the user's context, or `null` if
 * userGuid or userIdentifier are undefinedd.
 */
export const setSystemUserContextSQL = (
  userGuid: string,
  userIdentifier: string,
  systemUserType: SYSTEM_IDENTITY_SOURCE
): SQLStatement | null => {
  if (!userGuid || !userIdentifier) {
    return null;
  }

  return SQL`
    WITH patch_user_guid AS (
      UPDATE
        system_user
      SET
        user_guid = ${userGuid}
      WHERE
        user_guid IS NULL
      AND
        user_identifier = ${userIdentifier}
      RETURNING
        *
    )
    SELECT api_set_context(${userGuid}, ${systemUserType});
  `;
};
