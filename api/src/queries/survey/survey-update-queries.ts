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
    UPDATE survey SET
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
    where
      p_id = ${projectId}
    and
      id = ${surveyId}
    and
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
 * SQL query to update a species row in the study_species table.
 *
 * @param {number} species id
 * @param {number} project id
 * @param {number} survey id
 * @returns {SQLStatement} sql query object
 */
export const updateSpeciesSQL = (speciesId: number, projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'updateSpeciesSQL', message: 'params', updateSpeciesSQL, projectId });

  if (!speciesId || !projectId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE study_species SET s_id = ${surveyId} where p_id = ${projectId} and wu_id = ${speciesId};
  `;

  defaultLog.debug({
    label: 'updateSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
