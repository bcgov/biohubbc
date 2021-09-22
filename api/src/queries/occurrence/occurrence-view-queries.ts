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
      public.ST_asGeoJSON(o.geography) as geometry,
      o.taxonid,
      o.lifestage,
      o.vernacularname,
      o.individualcount,
      o.organismquantity,
      o.organismquantitytype
    FROM
      occurrence as o
    LEFT OUTER JOIN
      occurrence_submission as os
    ON
      o.occurrence_submission_id = os.occurrence_submission_id
    WHERE
      o.occurrence_submission_id = ${occurrenceSubmissionId}
    AND
      os.delete_timestamp is null;
  `;

  defaultLog.debug({
    label: 'getOccurrencesForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
