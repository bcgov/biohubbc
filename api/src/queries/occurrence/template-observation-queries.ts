import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/occurrence/template-observation-queries');

/**
 * SQL query to get template observations for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getTemplateObservationsSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getTemplateObservationsSQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  SELECT
    os.occurrence_submission_id as id,
    os.update_date,
    os.create_date,
    os.key,
    os.file_name,
    os_uniq.occurrence_submission_id as id2
  from
    occurrence_submission os
  left outer join (
    select key, max(occurrence_submission_id) as occurrence_submission_id from occurrence_submission
    group by key
    ) os_uniq
    on os.key = os_uniq.key
    and os.occurrence_submission_id = os_uniq.occurrence_submission_id
  where
    os_uniq.occurrence_submission_id is not null
  and
    os.survey_id = ${surveyId}
  ORDER BY
    os.event_timestamp DESC
  LIMIT 1;
  `;

  defaultLog.debug({
    label: 'getTemplateObservationsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
