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
