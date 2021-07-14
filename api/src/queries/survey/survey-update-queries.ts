import { SQL, SQLStatement } from 'sql-template-strings';
import { PutSurveyDetailsData, PutSurveyProprietorData } from '../../models/survey-update';
import { getLogger } from '../../utils/logger';
import { generateGeometryCollectionSQL } from '../generate-geometry-collection';

const defaultLog = getLogger('queries/survey/survey-update-queries');

/**
 * SQL query to update a permit row based on an old survey association.
 * Unset the survey id column (remove the association of the permit to the survey)
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const unassociatePermitFromSurveySQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'unassociatePermitFromSurveySQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE permit
    SET
      survey_id = ${null}
    WHERE
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'unassociatePermitFromSurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a permit row based on a new survey association.
 *
 * @param {number} surveyId
 * @param {string} permitNumber
 * @returns {SQLStatement} sql query object
 */
export const putNewSurveyPermitNumberSQL = (surveyId: number, permitNumber: string): SQLStatement | null => {
  defaultLog.debug({
    label: 'putNewSurveyPermitNumberSQL',
    message: 'params',
    surveyId,
    permitNumber
  });

  if (!surveyId || !permitNumber) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE permit
    SET
      survey_id = ${surveyId}
    WHERE
      number = ${permitNumber};
  `;

  defaultLog.debug({
    label: 'putNewSurveyPermitNumberSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a survey row.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {PutSurveyDetailsData} data
 * @returns {SQLStatement} sql query object
 */
export const putSurveyDetailsSQL = (
  projectId: number,
  surveyId: number,
  data: PutSurveyDetailsData | null,
  revision_count: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putSurveyDetailsSQL',
    message: 'params',
    projectId,
    surveyId,
    data,
    revision_count
  });

  if (!projectId || !surveyId || !data) {
    return null;
  }

  const geometrySqlStatement = SQL``;

  if (data.geometry && data.geometry.length) {
    const geometryCollectionSQL = generateGeometryCollectionSQL(data.geometry);

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
      name = ${data.name},
      objectives = ${data.objectives},
      start_date = ${data.start_date},
      end_date = ${data.end_date},
      lead_first_name = ${data.lead_first_name},
      lead_last_name = ${data.lead_last_name},
      location_name = ${data.location_name},
      geography =
  `;

  sqlStatement.append(geometrySqlStatement);

  sqlStatement.append(SQL`
    WHERE
      project_id = ${projectId}
    AND
      survey_id = ${surveyId}
    AND
      revision_count = ${revision_count};
  `);

  defaultLog.debug({
    label: 'putSurveyDetailsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a survey row.
 *
 * @param {number} surveyId
 * @param {number} surveyProprietorId
 * @param {PutSurveyProprietorData} data
 * @returns {SQLStatement} sql query object
 */
export const putSurveyProprietorSQL = (surveyId: number, data: PutSurveyProprietorData | null): SQLStatement | null => {
  defaultLog.debug({
    label: 'putSurveyProprietorSQL',
    message: 'params',
    surveyId,
    data
  });

  if (!surveyId || !data) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE survey_proprietor
    SET
      proprietor_type_id = ${data.prt_id},
      first_nations_id = ${data.fn_id},
      rationale = ${data.rationale},
      proprietor_name = ${data.proprietor_name},
      disa_required = ${data.disa_required},
      revision_count = ${data.revision_count}
    WHERE
      survey_proprietor_id = ${data.id}
    AND
      survey_id = ${surveyId}
  `;

  defaultLog.debug({
    label: 'putSurveyProprietorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
