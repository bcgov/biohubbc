import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/administrative-activity/administrative-activity-queries');

/**
 * SQL query to get a list of administrative activities, optionally filtered by the administrative activity type name.
 *
 * @param {string} [administrativeActivityTypeName]
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativeActivitiesSQL = (
  administrativeActivityTypeName?: string,
  userIdentifier?: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'getAdministrativeActivitiesSQL',
    message: 'params',
    administrativeActivityTypeName,
    userIdentifier
  });

  const sqlStatement = SQL`
    SELECT
      aa.id as id,
      aat.id as type,
      aat.name as type_name,
      aast.id as status,
      aast.name as status_name,
      aa.description,
      aa.data,
      aa.notes,
      aa.create_date
    FROM
      administrative_activity aa
    LEFT OUTER JOIN
      administrative_activity_status_type aast
    ON
      aa.aast_id = aast.id
    LEFT OUTER JOIN
      administrative_activity_type aat
    ON
      aa.aat_id = aat.id
  `;

  if (administrativeActivityTypeName) {
    sqlStatement.append(SQL`
      WHERE
        aat.name = ${administrativeActivityTypeName}
    `);
  }

  if (userIdentifier) {
    sqlStatement.append(SQL`
      WHERE
        aa.data -> 'username' = ${userIdentifier}
    `);
  }

  sqlStatement.append(';');

  defaultLog.debug({
    label: 'getAdministrativeActivitiesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

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
      (aa.data -> 'username')::text =  '"' || ${userIdentifier} || '"'
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

/**
 * SQL query update and existing administrative activity record.
 *
 * @param {number} administrativeActivityId
 * @param {number} administrativeActivityStatusTypeId
 * @return {*}  {(SQLStatement | null)}
 */
export const putAdministrativeActivitySQL = (
  administrativeActivityId: number,
  administrativeActivityStatusTypeId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putAdministrativeActivitySQL',
    message: 'params',
    administrativeActivityId,
    administrativeActivityStatusTypeId
  });

  if (!administrativeActivityId || !administrativeActivityStatusTypeId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      administrative_activity
    SET
      aast_id = ${administrativeActivityStatusTypeId}
    WHERE
      id = ${administrativeActivityId}
    RETURNING
      id;
  `;

  defaultLog.debug({
    label: 'putAdministrativeActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
