import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_USER_TYPE } from '../constants/database';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/template-queries');

export const setSystemUserContextSQL = (
  userIdentifier: string,
  systemUserType: SYSTEM_USER_TYPE
): SQLStatement | null => {
  defaultLog.debug({ label: 'setSystemUserContextSQL', message: 'params', userIdentifier, systemUserType });

  if (!userIdentifier || !systemUserType) {
    return null;
  }

  let sqlStatement;

  if (systemUserType === SYSTEM_USER_TYPE.IDIR) {
    sqlStatement = SQL`select api_set_context(${userIdentifier}, null);`;
  } else {
    sqlStatement = SQL`select api_set_context(null, ${userIdentifier});`;
  }

  defaultLog.debug({
    label: 'postTemplateSQL',
    message: 'sql',
    'sqlStatement.text': JSON.stringify(sqlStatement.text),
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
