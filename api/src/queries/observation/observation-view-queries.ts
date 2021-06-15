import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/observation/observation-view-queries');

/**
 * SQL query to get all observations for list view.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getBlockObservationListSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getBlockObservationListSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      b_id,
      observation_cnt,
      start_datetime,
      end_datetime
    FROM
      block_observation
    WHERE
      s_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getBlockObservationListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
