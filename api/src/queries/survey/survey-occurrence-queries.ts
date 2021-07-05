import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSurveyOccurrence } from '../../models/survey-occurrence';
import { getLogger } from '../../utils/logger';
import { parseUTMString } from '../../utils/spatial-utils';

const defaultLog = getLogger('queries/survey/survey-occurrence-queries');

export const postSurveyOccurrenceSQL = (surveyId: number, occurrence: PostSurveyOccurrence): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyOccurrenceSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  // TODO update to use new occurrence + occurrence_submission tables
  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_occurrence (
      s_id,
      associatedtaxa,
      lifestage,
      data,
      geography
    ) VALUES (
      ${surveyId},
      ${occurrence.associatedtaxa},
      ${occurrence.lifestage},
      ${occurrence.data}
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
    label: 'postSurveyOccurrenceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
