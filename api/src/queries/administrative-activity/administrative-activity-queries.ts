import { SQL, SQLStatement } from 'sql-template-strings';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../paths/administrative-activities';

/**
 * SQL query to get a list of administrative activities.
 *
 * @param {string[]} [administrativeActivityTypeNames]
 * @param {string[]} [administrativeActivityStatusTypes]
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativeActivitiesSQL = (
  administrativeActivityTypeNames?: string[],
  administrativeActivityStatusTypes?: string[]
): SQLStatement => {
  const sqlStatement = SQL`
    SELECT
      aa.administrative_activity_id as id,
      aat.administrative_activity_type_id as type,
      aat.name as type_name,
      aast.administrative_activity_status_type_id as status,
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
      aa.administrative_activity_status_type_id = aast.administrative_activity_status_type_id
    LEFT OUTER JOIN
      administrative_activity_type aat
    ON
      aa.administrative_activity_type_id = aat.administrative_activity_type_id
    WHERE
      1 = 1
  `;

  if (administrativeActivityTypeNames?.length) {
    sqlStatement.append(SQL`
      AND
        aat.name IN (
    `);

    // Add first element
    sqlStatement.append(SQL`${administrativeActivityTypeNames[0]}`);

    for (let idx = 1; idx < administrativeActivityTypeNames.length; idx++) {
      // Add subsequent elements, which get a comma prefix
      sqlStatement.append(SQL`, ${administrativeActivityTypeNames[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }

  if (administrativeActivityStatusTypes?.length) {
    sqlStatement.append(SQL`
      AND
        aast.name IN (
    `);

    // Add first element
    sqlStatement.append(SQL`${administrativeActivityStatusTypes[0]}`);

    for (let idx = 1; idx < administrativeActivityStatusTypes.length; idx++) {
      // Add subsequent elements, which get a comma prefix
      sqlStatement.append(SQL`, ${administrativeActivityStatusTypes[idx]}`);
    }

    sqlStatement.append(SQL`)`);
  }

  sqlStatement.append(`;`);

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
  if (!systemUserId) {
    return null;
  }

  return SQL`
  INSERT INTO administrative_activity (
    reported_system_user_id,
    administrative_activity_type_id,
    administrative_activity_status_type_id,
    data
  ) VALUES (
    ${systemUserId},
    1,
    1,
    ${data}
  )
  RETURNING
    administrative_activity_id as id,
    create_date::timestamptz
`;
};

/**
 * SQL query to count pending records in the administrative_activity table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @return {*}  {(SQLStatement | null)}
 */
export const countPendingAdministrativeActivitiesSQL = (userIdentifier: string): SQLStatement | null => {
  if (!userIdentifier) {
    return null;
  }

  return SQL`
    SELECT *
    FROM
      administrative_activity aa
    LEFT OUTER JOIN
      administrative_activity_status_type aast
    ON
      aa.administrative_activity_status_type_id = aast.administrative_activity_status_type_id
    WHERE
    (aa.data -> 'username')::text =  '"' || ${userIdentifier} || '"'
  AND aast.name = 'Pending';
`;
};

/**
 * SQL query update an existing administrative activity record.
 *
 * @param {number} administrativeActivityId
 * @param {ADMINISTRATIVE_ACTIVITY_STATUS_TYPE} administrativeActivityStatusTypeName
 * @return {*}  {(SQLStatement | null)}
 */
export const putAdministrativeActivitySQL = (
  administrativeActivityId: number,
  administrativeActivityStatusTypeName: ADMINISTRATIVE_ACTIVITY_STATUS_TYPE
): SQLStatement => {
  return SQL`

    UPDATE
      administrative_activity
    SET
      administrative_activity_status_type_id = (
        SELECT
          administrative_activity_status_type_id
        FROM
          administrative_activity_status_type
        WHERE
          name = ${administrativeActivityStatusTypeName}
      )
    WHERE
      administrative_activity_id = ${administrativeActivityId}
    RETURNING
      administrative_activity_id as id;
  `;
};
