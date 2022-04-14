import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get all non-sampling permits
 *
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getNonSamplingPermitsSQL = (systemUserId: number | null): SQLStatement | null => {
  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      permit_id,
      number,
      type
    FROM
      permit
    WHERE
      system_user_id = ${systemUserId}
    AND
      project_id IS NULL;
  `;

  return sqlStatement;
};

/**
 * SQL query to get all permit numbers by system user id
 *
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getAllPermitsSQL = (systemUserId: number | null): SQLStatement | null => {
  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      per.permit_id as id,
      per.number,
      per.type,
      CASE
        WHEN per.project_id IS NULL THEN per.coordinator_agency_name
        WHEN per.project_id IS NOT NULL THEN p.coordinator_agency_name
      END as coordinator_agency,
      p.name as project_name
    FROM
      permit as per
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = per.project_id
    WHERE
      system_user_id = ${systemUserId};
  `;

  return sqlStatement;
};
