import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';
import { PostBlockObservationObject } from '../../models/block-observation-create';

const defaultLog = getLogger('queries/observation-create-queries');

/**
 * SQL query to insert a row in the block_observation table.
 *
 * @param {number} surveyId
 * @param {unknown} observationPostData JSON data blob
 * @return {*}  {(SQLStatement | null)}
 */
export const postBlockObservationSQL = (
  surveyId: number,
  observationPostData: PostBlockObservationObject
): SQLStatement | null => {
  defaultLog.debug({ label: 'postBlockObservationSQL', message: 'params', observationPostData });

  if (!surveyId || !observationPostData) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO block_observation (
      b_id,
      survey_id,
      start_datetime,
      end_datetime,
      observation_cnt,
      data
    ) VALUES (
      ${observationPostData.block_name},
      ${surveyId},
      ${observationPostData.start_datetime},
      ${observationPostData.end_datetime},
      ${observationPostData.observation_count},
      ${observationPostData.observation_data}
    )
    RETURNING
      block_observation_id
  `;

  defaultLog.debug({
    label: 'postBlockObservationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
