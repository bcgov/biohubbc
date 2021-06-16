import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/observation-create-queries');

/**
 * SQL query to insert a row in the webform_draft table.
 *
 * @param {number} systemUserId the ID of the user in context
 * @param {string} name name of the draft record
 * @param {unknown} data JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const postBlockObservationSQL = (surveyId: number, data: unknown): SQLStatement | null => {
  defaultLog.debug({ label: 'postBlockObservationSQL', message: 'params', data });

  if (!surveyId || !data) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO block_observation (
      b_id,
      s_id,
      start_datetime,
      end_datetime,
      observation_cnt,
      data
    ) VALUES (
      1,
      1,
      now(),
      now(),
      3,
      ${data}
    )
    RETURNING
      id,
      create_date::timestamptz,
      update_date::timestamptz;
  `;

  defaultLog.debug({
    label: 'postBlockObservationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
