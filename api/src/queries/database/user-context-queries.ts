import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';

/**
 * Returns an SQL query for setting the user's context. As a side-effect, it first updates the user's
 * `user_guid` to reflect the given `userGuid` value, but only if it is currently `null` (which happens
 * when new system users are created and a GUID is not provided).
 *
 * @param {string} userGuid the GUID of the user
 * @param {string} userIdentifier the user's identifier
 * @param {string} userIdentitySource The user's identity source
 * @returns {*} {SQLStatement | null} The SQL statement for setting the user's context, or `null` if
 * userGuid or userIdentifier are undefinedd.
 */
export const setSystemUserContextSQL = (
  userGuid: string,
  userIdentitySource: SYSTEM_IDENTITY_SOURCE
): SQLStatement | null => {
  if (!userGuid) {
    return null;
  }

  return SQL`
    SELECT api_set_context(${userGuid}, ${userIdentitySource});
  `;
};

/**
 * @TODO jsdoc
 * 
 * @param userGuid
 * @param userIdentifier
 * @param {SYSTEM_IDENTITY_SOURCE} userIdentitySource
 * @returns
 */
export const patchUserGuidSQL = (userGuid: string, userIdentifier: string, userIdentitySource: SYSTEM_IDENTITY_SOURCE): SQLStatement | null => {
  if (!userGuid || !userIdentifier || !userIdentitySource) {
    return null;
  }

  return SQL`
    UPDATE
      system_user
    SET
      user_guid = ${userGuid.toLowerCase()}
    WHERE
      system_user_id
    IN (
      SELECT
        su.system_user_id
      FROM
        system_user su
      LEFT JOIN
        user_identity_source uis
      ON
        uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        su.user_identifier ILIKE ${userIdentifier.toLowerCase()}
      AND
        uis.name ILIKE ${userIdentitySource}
      AND
        user_guid IS NULL
    );
  `;
};
