import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-create-queries');

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectParticipationBySystemUserSQL = (
  projectId: number,
  systemUserId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'getProjectParticipationBySystemUserSQL',
    message: 'params',
    projectId,
    systemUserId
  });

  if (!projectId || !systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      pp.project_id,
      pp.system_user_id,
      array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
      array_remove(array_agg(pr.name), NULL) AS project_role_names
    FROM
      project_participation pp
    LEFT JOIN
      project_role pr
    ON
      pp.project_role_id = pr.project_role_id
    WHERE
      pp.project_id = ${projectId}
    AND
      pp.system_user_id = ${systemUserId}
    GROUP BY
      pp.project_id,
      pp.system_user_id;
  `;

  defaultLog.info({
    label: 'getProjectParticipationBySystemUserSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
