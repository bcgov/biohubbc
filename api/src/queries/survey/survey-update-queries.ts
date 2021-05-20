import { SQL, SQLStatement } from 'sql-template-strings';
import { PutSurveyData } from '../../models/survey-update';
import { getLogger } from '../../utils/logger';
import { generateGeometryCollectionSQL } from '../generate-geometry-collection';

const defaultLog = getLogger('queries/survey/survey-update-queries');

/**
 * SQL query to update a survey row.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {PutSurveyData} survey
 * @returns {SQLStatement} sql query object
 */
export const putSurveySQL = (
  projectId: number,
  surveyId: number,
  survey: PutSurveyData | null,
  revision_count: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putSurveySQL',
    message: 'params',
    projectId,
    surveyId,
    survey,
    revision_count
  });

  if (!projectId || !surveyId || !survey) {
    return null;
  }

  const geometrySqlStatement = SQL``;

  if (survey.geometry && survey.geometry.length) {
    const geometryCollectionSQL = generateGeometryCollectionSQL(survey.geometry);

    geometrySqlStatement.append(SQL`
      public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
    `);

    geometrySqlStatement.append(geometryCollectionSQL);

    geometrySqlStatement.append(SQL`
      , 4326)))
    `);
  } else {
    geometrySqlStatement.append(SQL`
      null
    `);
  }

  const sqlStatement = SQL`
    UPDATE survey
    SET
      name = ${survey.name},
      objectives = ${survey.objectives},
      start_date = ${survey.start_date},
      end_date = ${survey.end_date},
      lead_first_name = ${survey.lead_first_name},
      lead_last_name = ${survey.lead_last_name},
      location_name = ${survey.location_name},
      geography =
  `;

  sqlStatement.append(geometrySqlStatement);

  sqlStatement.append(SQL`
    WHERE
      p_id = ${projectId}
    AND
      id = ${surveyId}
    AND
      revision_count = ${revision_count};
  `);

  defaultLog.debug({
    label: 'putSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to retrieve a survey row for update purposes.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyForUpdateSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyForUpdateSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.id,
      s.name,
      s.objectives,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      public.ST_asGeoJSON(s.geography) as geometry,
      s.revision_count,
      CASE
        WHEN ss.is_focal = TRUE THEN wtu.id
      END as focal_species,
      CASE
        WHEN ss.is_focal = FALSE THEN wtu.id
      END as ancillary_species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wu_id = wtu.id
    LEFT OUTER JOIN
      survey as s
    ON
      s.id = ss.s_id
    WHERE
      s.id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyForUpdateSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
