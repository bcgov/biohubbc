import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/observation/observation-view-queries');

/**
 * SQL query to get observations based on survey ID.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getObservationsForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getObservationsForViewSQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      public.ST_asGeoJSON(survey.geography) as geometry
    from
      survey
    where
      survey.id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getObservationsForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
