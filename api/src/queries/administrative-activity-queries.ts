import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/administrative-activity-queries');

/**
 * SQL query to insert a row in the administrative_activity table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const postAdministrativeActivitySQL = (systemUserId: number, data: unknown): SQLStatement | null => {
  defaultLog.debug({
    label: 'postAdministrativeActivitySQL',
    message: 'params',
    systemUserId: systemUserId,
    data: data
  });

  if (!systemUserId || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO administrative_activity (
      reported_su_id,
      aat_id,
      aast_id,
      data
    ) VALUES (
      ${systemUserId},
      1,
      1,
      ${data}
    )
    RETURNING
      id,
      create_date::timestamptz
  `;

  defaultLog.debug({
    label: 'postAdministrativeActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to count pending records in the administrative_activity table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @return {*}  {(SQLStatement | null)}
 */
export const countPendingAdministrativeActivitiesSQL = (userIdentifier: string): SQLStatement | null => {
  defaultLog.debug({ label: 'countPendingAdministrativeActivitiesSQL', message: 'params', userIdentifier });

  if (!userIdentifier) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT *
    FROM
      administrative_activity aa
    LEFT OUTER JOIN
      administrative_activity_status_type aast
    ON
      aa.aast_id = aast.id
      WHERE
      (aa.data -> 'username')::text =  ${userIdentifier}
    AND aast.name = 'Pending';
  `;

  defaultLog.debug({
    label: 'countPendingAdministrativeActivitiesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
