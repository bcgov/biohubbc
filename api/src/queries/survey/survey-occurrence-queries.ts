import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSurveyOccurrence } from '../../models/survey-occurrence';
import { getLogger } from '../../utils/logger';
// import { generateGeometryFromUTM } from '../generate-geometry-collection';

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

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_occurrence (
      s_id,
      associatedtaxa,
      lifestage,
      data
    ) VALUES (
      ${surveyId},
      ${occurrence.associatedtaxa},
      ${occurrence.lifestage},
      ${occurrence.data}
    );
  `;

  // TODO add UTM
  // const geometryCollectionSQL = generateGeometryFromUTM(occurrence.geodeticDatum, occurrence.verbatimCoordinates);

  // sqlStatement.append(SQL`
  //     ,public.geography(
  //       public.ST_Force2D(
  //         public.ST_SetSRID(
  //   `);

  // sqlStatement.append(geometryCollectionSQL);

  // sqlStatement.append(SQL`
  //     , 4326)))
  //   `);

  // sqlStatement.append(');');

  defaultLog.debug({
    label: 'postSurveyOccurrenceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
