import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-view-queries');

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
      aat.id as aat,
      aast.id as aast,
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
