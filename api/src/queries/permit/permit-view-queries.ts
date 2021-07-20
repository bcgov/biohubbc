import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-view-queries');

/**
 * SQL query to get all non-sampling permits
 *
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getNonSamplingPermitsSQL = (systemUserId: number | null): SQLStatement | null => {
  defaultLog.debug({
    label: 'getNonSamplingPermitsSQL',
    message: 'params',
    systemUserId
  });

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

  defaultLog.debug({
    label: 'getNonSamplingPermitsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all permit numbers by system user id
 *
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getAllPermitsSQL = (systemUserId: number | null): SQLStatement | null => {
  defaultLog.debug({
    label: 'getAllPermitsSQL',
    message: 'params',
    systemUserId
  });

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

  defaultLog.debug({
    label: 'getAllPermitsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
