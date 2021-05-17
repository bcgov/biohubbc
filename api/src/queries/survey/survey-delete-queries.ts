import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-delete-queries');

/**
 * SQL query to delete survey study species
 *
 * @param {number} speciesId
 * @param {number} projectId
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyStudySpeciesSQL = (speciesId: number, projectId: number, surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveyStudySpeciesSQL',
    message: 'params',
    speciesId,
    projectId,
    surveyId
  });

  if (!speciesId || !projectId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from study_species
    WHERE
      p_id = ${projectId}
    AND
      s_id = ${surveyId}
    AND
      wu_id = ${speciesId}
  `;

  defaultLog.debug({
    label: 'deleteSurveyStudySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
