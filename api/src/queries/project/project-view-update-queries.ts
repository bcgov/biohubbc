import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-create-queries');

/**
 * SQL query to get project stakeholder partnerships.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getStakeholderPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getStakeholderPartnershipsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      stakeholder_partnership
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getStakeholderPartnershipsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
