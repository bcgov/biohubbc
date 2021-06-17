import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/observation/observation-update-queries');

/**
 * SQL query to get details for a block observation (for update purposes).
 *
 * @param {number} observationId
 * @returns {SQLStatement} sql query object
 */
export const getBlockObservationSQL = (observationId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getBlockObservationSQL',
    message: 'params',
    observationId
  });

  if (!observationId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      data
    FROM
      block_observation
    WHERE
      id = ${observationId};
  `;

  defaultLog.debug({
    label: 'getBlockObservationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
