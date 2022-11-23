import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to delete survey funding sources rows based on survey id.
 *
 * @param {number} surveyIdF
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyFundingSourcesBySurveyIdSQL = (surveyId: number): SQLStatement => {
  return SQL`
    DELETE
      from survey_funding_source
    WHERE
      survey_id = ${surveyId};
  `;
};

/**
 * SQL query to delete survey funding sources rows based on project funding source id.
 *
 * @param {number | undefined} projectFundingSourceId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyFundingSourceByProjectFundingSourceIdSQL = (
  projectFundingSourceId: number | undefined
): SQLStatement | null => {
  if (!projectFundingSourceId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source
    WHERE
      project_funding_source_id = ${projectFundingSourceId};
  `;

  return sqlStatement;
};

/**
 * SQL query to delete survey funding sources rows if deleted from project level
 *
 * @param {(any[] | undefined)} projectFundingSourceIds
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteSurveyFundingSourceConnectionToProjectSQL = (
  projectFundingSourceIds: any[] | undefined
): SQLStatement | null => {
  if (!projectFundingSourceIds) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source sfs
    WHERE
      sfs.project_funding_source_id
    NOT IN
      ( ${projectFundingSourceIds[0]}`;

  for (let i = 1; i < projectFundingSourceIds.length; i++) {
    sqlStatement.append(`, ${projectFundingSourceIds[i]}`);
  }
  sqlStatement.append(`);`);

  return sqlStatement;
};

/**
 * SQL query to delete all survey species rows.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteAllSurveySpeciesSQL = (surveyId: number): SQLStatement => {
  return SQL`
    DELETE
      from study_species
    WHERE
      survey_id = ${surveyId};
  `;
};

/**
 * SQL query to delete survey proprietor rows.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyProprietorSQL = (surveyId: number): SQLStatement => {
  return SQL`
    DELETE
      from survey_proprietor
    WHERE
      survey_id = ${surveyId};
  `;
};

/**
 * SQL query to delete a survey row (and associated data) based on survey ID.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveySQL = (surveyId: number): SQLStatement => {
  return SQL`call api_delete_survey(${surveyId})`;
};

/**
 * SQL query to delete survey proprietor rows.
 *
 * @param {number} surveyId
 * @param {number} surveyProprietorId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyVantageCodesSQL = (surveyId: number): SQLStatement => {
  return SQL`
    DELETE
      from survey_vantage
    WHERE
      survey_id = ${surveyId};
  `;
};
