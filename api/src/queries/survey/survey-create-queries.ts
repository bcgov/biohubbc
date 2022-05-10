import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSurveyObject, PostSurveyProprietorData } from '../../models/survey-create';
import { queries } from '../queries';

/**
 * SQL query to insert a survey row.
 *
 * @param {number} projectId
 * @param {PostSurveyObject} survey
 * @returns {SQLStatement} sql query object
 */
export const postSurveySQL = (projectId: number, survey: PostSurveyObject): SQLStatement | null => {
  if (!projectId || !survey) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey (
      project_id,
      name,
      additional_details,
      ecological_season_id,
      intended_outcome_id,
      start_date,
      end_date,
      lead_first_name,
      lead_last_name,
      location_name,
      geojson,
      field_method_id,
      surveyed_all_areas,
      geography
    ) VALUES (
      ${projectId},
      ${survey.survey_name},
      ${survey.additional_details},
      ${survey.ecological_season_id},
      ${survey.intended_outcome_id},
      ${survey.start_date},
      ${survey.end_date},
      ${survey.biologist_first_name},
      ${survey.biologist_last_name},
      ${survey.survey_area_name},
      ${JSON.stringify(survey.geometry)},
      ${survey.field_method_id},
      ${survey.surveyed_all_areas}
  `;

  if (survey.geometry && survey.geometry.length) {
    const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(survey.geometry);

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
      survey_id as id;
  `);

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
  if (!surveyId || !survey_proprietor) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  INSERT INTO survey_proprietor (
    survey_id,
    proprietor_type_id,
    first_nations_id,
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
    survey_proprietor_id as id;
`;

  return sqlStatement;
};

/**
 * SQL query to insert a survey funding source row into the survey_funding_source table.
 *
 * @param {number} surveyId
 * @param {number} fundingSourceId
 * @returns {SQLStatement} sql query object
 */
export const insertSurveyFundingSourceSQL = (surveyId: number, fundingSourceId: number): SQLStatement | null => {
  if (!surveyId || !fundingSourceId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_funding_source (
      survey_id,
      project_funding_source_id
    ) VALUES (
      ${surveyId},
      ${fundingSourceId}
    );
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a survey permit row into the permit table.
 *
 * @param {number | null} systemUserId
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} permitNumber
 * @param {string} permitType
 * @returns {SQLStatement} sql query object
 */
export const postNewSurveyPermitSQL = (
  systemUserId: number | null,
  projectId: number,
  surveyId: number,
  permitNumber: string,
  permitType: string
): SQLStatement | null => {
  if (!systemUserId || !projectId || !surveyId || !permitNumber || !permitType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO permit (
      system_user_id,
      project_id,
      survey_id,
      number,
      type
    ) VALUES (
      ${systemUserId},
      ${projectId},
      ${surveyId},
      ${permitNumber},
      ${permitType}
    );
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postFocalSpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wldtaxonomic_units_id,
      is_focal,
      survey_id
    ) VALUES (
      ${speciesId},
      TRUE,
      ${surveyId}
    ) RETURNING study_species_id as id;
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postAncillarySpeciesSQL = (speciesId: number, surveyId: number): SQLStatement | null => {
  if (!speciesId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO study_species (
      wldtaxonomic_units_id,
      is_focal,
      survey_id
    ) VALUES (
      ${speciesId},
      FALSE,
      ${surveyId}
    ) RETURNING study_species_id as id;
  `;

  return sqlStatement;
};

/**
 * SQL query to insert a ancillary species row into the study_species table.
 *
 * @param {number} speciesId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const postVantageCodesSQL = (vantageCodeId: number, surveyId: number): SQLStatement | null => {
  if (!vantageCodeId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_vantage (
      vantage_id,
      survey_id
    ) VALUES (
      ${vantageCodeId},
      ${surveyId}
    ) RETURNING survey_vantage_id as id;
  `;

  return sqlStatement;
};
