import { SQL, SQLStatement } from 'sql-template-strings';

export const getOccurrencesForViewSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      public.ST_asGeoJSON(o.geography) as geometry,
      o.taxonid,
      o.occurrence_id,
      o.lifestage,
      o.sex,
      o.vernacularname,
      o.individualcount,
      o.organismquantity,
      o.organismquantitytype,
      o.eventdate
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

  return sqlStatement;
};
