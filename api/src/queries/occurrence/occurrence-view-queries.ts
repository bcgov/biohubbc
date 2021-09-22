import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/occurrence/occurrence-view-queries');

export const getOccurrencesForViewSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getOccurrencesForViewSQL',
    message: 'params',
    occurrenceSubmissionId
  });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      public.ST_asGeoJSON(geography) as geometry,
      taxonid,
      lifestage,
      vernacularname,
      individualcount,
      organismquantity,
      organismquantitytype
    FROM
      occurrence
    WHERE
      occurrence_submission_id = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'getOccurrencesForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
