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
export const deleteSurveySQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`call api_delete_survey(${surveyId})`;

  return sqlStatement;
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
