import { SQL, SQLStatement } from 'sql-template-strings';
import { PostOccurrence } from '../../models/occurrence-create';
import { getLogger } from '../../utils/logger';
import { parseUTMString } from '../../utils/spatial-utils';

const defaultLog = getLogger('queries/occurrence/occurrence-create-queries');

export const postOccurrenceSQL = (occurrenceSubmissionId: number, occurrence: PostOccurrence): SQLStatement | null => {
  defaultLog.debug({
    label: 'postOccurrenceSQL',
    message: 'params',
    occurrenceSubmissionId,
    occurrence
  });

  if (!occurrenceSubmissionId || !occurrence) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO occurrence (
      occurrence_submission_id,
      taxonid,
      lifestage,
      data,
      vernacularname,
      eventdate,
      individualcount,
      organismquantity,
      organismquantitytype,
      geography
    ) VALUES (
      ${occurrenceSubmissionId},
      ${occurrence.associatedTaxa},
      ${occurrence.lifeStage},
      ${occurrence.data},
      ${occurrence.vernacularName},
      ${occurrence.eventDate},
      ${occurrence.individualCount},
      ${occurrence.organismQuantity},
      ${occurrence.organismQuantityType}
  `;

  const utm = parseUTMString(occurrence.verbatimCoordinates);

  if (utm) {
    sqlStatement.append(SQL`
      ,public.ST_Transform(
        public.ST_SetSRID(
          public.ST_MakePoint(${utm.easting}, ${utm.northing}),
          ${utm.zone_srid}
        ),
        4326
      )
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(');');

  defaultLog.debug({
    label: 'postOccurrenceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
