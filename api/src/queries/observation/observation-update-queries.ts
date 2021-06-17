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
      data,
      revision_count
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

/**
 * SQL query to update details for a block observation.
 *
 * @param {number} observationId
 * @param {any} observationData
 * @returns {SQLStatement} sql query object
 */
export const updateBlockObservationSQL = (observationId: number, observationData: any): SQLStatement | null => {
  defaultLog.debug({
    label: 'updateBlockObservationSQL',
    message: 'params',
    observationId,
    observationData
  });

  if (!observationId || !observationData) {
    return null;
  }

  console.log('HEHEHEHHEHEHEHEEHHEHHE');
  console.log(observationData.block_name);

  const sqlStatement = SQL`
    UPDATE
      block_observation
    SET
      b_id = ${observationData.block_name},
      start_datetime = ${observationData.start_datetime},
      end_datetime = ${observationData.end_datetime},
      observation_cnt = ${observationData.observation_count},
      data = ${observationData.observation_data}
    WHERE
      id = ${observationId}
    AND
      revision_count = ${observationData.revision_count}
  `;

  defaultLog.debug({
    label: 'updateBlockObservationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
