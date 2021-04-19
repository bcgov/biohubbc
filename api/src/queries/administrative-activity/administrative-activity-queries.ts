import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-view-queries');

/**
 * SQL query to get a administrative activities.
 *
 * @param {string} [administrativeActivityTypeName]
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativeActivitySQL = (administrativeActivityTypeName?: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getAdministrativeActivitySQL', message: 'params', administrativeActivityTypeName });

  const sqlStatement = SQL`
    SELECT
      aat.id,
      aast.id,
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
        aat.name = ${administrativeActivityTypeName};
    `);
  }

  sqlStatement.append(';');

  defaultLog.debug({
    label: 'getAdministrativeActivitySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
