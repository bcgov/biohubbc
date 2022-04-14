import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PutSurveyDetailsData,
  PutSurveyProprietorData,
  PutSurveyPurposeAndMethodologyData
} from '../../models/survey-update';

import { queries } from '../queries';

/**
 * SQL query to update a permit row based on an old survey association.
 * Unset the survey id column (remove the association of the permit to the survey)
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const unassociatePermitFromSurveySQL = (surveyId: number): SQLStatement | null => {
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
  if (!surveyId || !permitNumber) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE permit
    SET
      survey_id = ${surveyId}
    WHERE
      number = ${permitNumber}
    AND
      survey_id IS NULL;
  `;

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
  if (!projectId || !surveyId || !data) {
    return null;
  }

  const geometrySqlStatement = SQL``;

  if (data.geometry && data.geometry.length) {
    const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(data.geometry);

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
      start_date = ${data.start_date},
      end_date = ${data.end_date},
      lead_first_name = ${data.lead_first_name},
      lead_last_name = ${data.lead_last_name},
      location_name = ${data.location_name},
      geojson = ${JSON.stringify(data.geometry)},
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

  return sqlStatement;
};

/**
 * SQL query to update the publish status of a survey.
 *
 * @param {number} surveyId
 * @param {boolean} publish
 * @returns {SQLStatement} sql query object
 */
export const updateSurveyPublishStatusSQL = (surveyId: number, publish: boolean): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey
    SET
      publish_timestamp = `;

  if (publish) {
    sqlStatement.append(SQL`
        now()
      WHERE
        survey_id = ${surveyId}
      AND
        publish_timestamp IS NULL
    `);
  } else {
    sqlStatement.append(SQL`
        null
      WHERE
        survey_id = ${surveyId}
      AND
        publish_timestamp IS NOT NULL
    `);
  }

  sqlStatement.append(SQL`
    RETURNING
      survey_id as id;
  `);

  return sqlStatement;
};

/**
 * SQL query to update a survey row.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {PutSurveyPurposeAndMethodologyData} data
 * @returns {SQLStatement} sql query object
 */
export const putSurveyPurposeAndMethodologySQL = (
  surveyId: number,
  data: PutSurveyPurposeAndMethodologyData | null,
  revision_count: number
): SQLStatement | null => {
  if (!surveyId || !data) {
    return null;
  }

  const sqlStatement = SQL`
    UPDATE
      survey
    SET
      field_method_id = ${data.field_method_id},
     additional_details = ${data.additional_details},
      ecological_season_id = ${data.ecological_season_id},
      intended_outcome_id = ${data.intended_outcome_id}
    WHERE
      survey_id = ${surveyId}
    AND
      revision_count = ${revision_count};
  `;

  return sqlStatement;
};
