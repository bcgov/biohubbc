import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/user-context-queries');

export const setSystemUserContextSQL = (
  userIdentifier: string,
  systemUserType: SYSTEM_IDENTITY_SOURCE
): SQLStatement | null => {
  defaultLog.debug({ label: 'setSystemUserContextSQL', message: 'params', userIdentifier, systemUserType });

  if (!userIdentifier) {
    return null;
  }

  const sqlStatement = SQL`select api_set_context(${userIdentifier}, ${systemUserType});`;

  defaultLog.debug({
    label: 'setSystemUserContextSQL',
    message: 'sql',
    'sqlStatement.text': JSON.stringify(sqlStatement.text),
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
