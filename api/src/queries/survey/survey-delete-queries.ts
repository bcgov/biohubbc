import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-delete-queries');

/**
 * SQL query to delete survey funding sources rows based on survey id.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyFundingSourcesBySurveyIdSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveyFundingSourcesBySurveyIdSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source
    WHERE
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'deleteSurveyFundingSourcesBySurveyIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
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
  defaultLog.debug({
    label: 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL',
    message: 'params',
    projectFundingSourceId
  });

  if (!projectFundingSourceId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source
    WHERE
      project_funding_source_id = ${projectFundingSourceId};
  `;

  defaultLog.debug({
    label: 'deleteSurveyFundingSourceByProjectFundingSourceIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete survey focal species rows.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteFocalSpeciesSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteFocalSpeciesSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from study_species
    WHERE
      survey_id = ${surveyId}
    AND
      is_focal;
  `;

  defaultLog.debug({
    label: 'deleteFocalSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete survey ancillary species rows.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteAncillarySpeciesSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteAncillarySpeciesSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from study_species
    WHERE
      survey_id = ${surveyId}
    AND
      is_focal is FALSE;
  `;

  defaultLog.debug({
    label: 'deleteAncillarySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete survey proprietor rows.
 *
 * @param {number} surveyId
 * @param {number} surveyProprietorId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyProprietorSQL = (surveyId: number, surveyProprietorId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveyProprietorSQL',
    message: 'params',
    surveyId,
    surveyProprietorId
  });

  if ((!surveyId && surveyId !== 0) || (!surveyProprietorId && surveyProprietorId !== 0)) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_proprietor
    WHERE
      survey_proprietor_id = ${surveyProprietorId}
    AND
      survey_id = ${surveyId}
  `;

  defaultLog.debug({
    label: 'deleteSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a survey row (and associated data) based on survey ID.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveySQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveySQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`call api_delete_survey(${surveyId})`;

  defaultLog.debug({
    label: 'deleteSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete survey proprietor rows.
 *
 * @param {number} surveyId
 * @param {number} surveyProprietorId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyVantageCodesSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveyVantageCodeSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId && surveyId !== 0) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_vantage
    WHERE
      survey_id = ${surveyId}
  `;

  defaultLog.debug({
    label: 'deleteSurveyVantageCodeSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
