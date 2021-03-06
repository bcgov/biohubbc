import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';
import { PostSurveyObject, PostSurveyProprietorData } from '../../models/survey-create';
import { generateGeometryCollectionSQL } from '../generate-geometry-collection';

const defaultLog = getLogger('queries/survey/survey-create-queries');

/**
 * SQL query to insert a survey row.
 *
 * @param {number} projectId
 * @param {PostSurveyObject} survey
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (projectId: number, survey: PostSurveyObject): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveySQL',
    message: 'params',
    projectId,
    survey
  });

  if (!projectId || !survey) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey (
      p_id,
      name,
      objectives,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      location_name,
      geography
    ) VALUES (
      ${projectId},
      ${survey.survey_name},
      ${survey.survey_purpose},
      ${survey.start_date},
      ${survey.end_date},
      ${survey.biologist_first_name},
      ${survey.biologist_last_name},
      ${survey.survey_area_name}
  `;

  if (survey.geometry && survey.geometry.length) {
    const geometryCollectionSQL = generateGeometryCollectionSQL(survey.geometry);

    sqlStatement.append(SQL`
      ,public.geography(
        public.ST_Force2D(
          public.ST_SetSRID(
    `);

    sqlStatement.append(geometryCollectionSQL);

    sqlStatement.append(SQL`
      , 4326)))
    `);
  } else {
    sqlStatement.append(SQL`
      ,null
    `);
  }

  sqlStatement.append(SQL`
    )
    RETURNING
      id;
  `);

  defaultLog.debug({
    label: 'postSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a survey_proprietor row.
 *
 * @param {number} surveyId
 * @param {PostSurveyProprietorData} surveyProprietor
 * @returns {SQLStatement} sql query object
 */
export const postSurveyProprietorSQL = (
  surveyId: number,
  survey_proprietor: PostSurveyProprietorData
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyProprietorSQL',
    message: 'params',
    surveyId,
    survey_proprietor
  });

  if (!surveyId || !survey_proprietor) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  INSERT INTO survey_proprietor (
    s_id,
    prt_id,
    fn_id,
    rationale,
    proprietor_name,
    disa_required
  ) VALUES (
    ${surveyId},
    ${survey_proprietor.prt_id},
    ${survey_proprietor.fn_id},
    ${survey_proprietor.rationale},
    ${survey_proprietor.proprietor_name},
    ${survey_proprietor.disa_required}
  )
  RETURNING
    id;
`;

  defaultLog.debug({
    label: 'postSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a survey permit row into the permit table.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} permitNumber
 * @param {string} permitType
 * @returns {SQLStatement} sql query object
 */
export const postNewSurveyPermitSQL = (
  projectId: number,
  surveyId: number,
  permitNumber: string,
  permitType: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postNewSurveyPermitSQL',
    message: 'params',
    projectId,
    surveyId,
    permitNumber,
    permitType
  });

  if (!projectId || !surveyId || !permitNumber || !permitType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO permit (
      p_id,
      s_id,
      number,
      type
    ) VALUES (
      ${projectId},
      ${surveyId},
      ${permitNumber},
      ${permitType}
    );
  `;

  defaultLog.debug({
    label: 'postNewSurveyPermitSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row into the study_species table.
 *
 * @param {number} species id
 * @param {number} survey id
 * @returns {SQLStatement} sql query object
 */
export const postFocalSpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postFocalSpeciesSQL', message: 'params', speciesId, surveyId });

  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wu_id,
      is_focal,
      s_id
    ) VALUES (
      ${speciesId},
      TRUE,
      ${surveyId}
    ) RETURNING id;
  `;

  defaultLog.debug({
    label: 'postFocalSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row into the study_species table.
 *
 * @param {number} species id
 * @param {number} survey id
 * @returns {SQLStatement} sql query object
 */
export const postAncillarySpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postAncillarySpeciesSQL', message: 'params', speciesId, surveyId });

  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wu_id,
      is_focal,
      s_id
    ) VALUES (
      ${speciesId},
      FALSE,
      ${surveyId}
    ) RETURNING id;
  `;

  defaultLog.debug({
    label: 'postAncillarySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
