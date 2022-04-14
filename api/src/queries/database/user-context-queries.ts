import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';

export const setSystemUserContextSQL = (
  userIdentifier: string,
  systemUserType: SYSTEM_IDENTITY_SOURCE
): SQLStatement | null => {
  if (!userIdentifier) {
    return null;
  }

  const sqlStatement = SQL`select api_set_context(${userIdentifier}, ${systemUserType});`;

  return sqlStatement;
};
