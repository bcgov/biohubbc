import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/occurrence/occurrence-view-queries');

export const getOccurrenceSubmissionIdsSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getOccurrenceSubmissionIdsSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT occurrence_submission_id as id
    FROM occurrence_submission
    WHERE survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getOccurrenceSubmissionIdsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

export const getOccurrenceGeometrySQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getOccurrenceGeometrySQL',
    message: 'params',
    occurrenceSubmissionId
  });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT public.ST_asGeoJSON(geography) as geometry
    FROM occurrence
    WHERE occurrence_submission_id = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'getOccurrenceGeometrySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
