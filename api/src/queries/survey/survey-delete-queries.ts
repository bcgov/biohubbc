import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-delete-queries');

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
      s_id = ${surveyId}
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
      s_id = ${surveyId}
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
      id = ${surveyProprietorId}
    AND
      s_id = ${surveyId}
  `;

  defaultLog.debug({
    label: 'deleteSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
