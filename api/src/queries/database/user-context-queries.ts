import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';

export const setSystemUserContextSQL = (
  userGuid: string,
  systemUserType: SYSTEM_IDENTITY_SOURCE
): SQLStatement | null => {
  if (!userGuid) {
    return null;
  }

  return SQL`select api_set_context(${userGuid}, ${systemUserType});`;
};
