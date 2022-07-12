import { Knex } from 'knex';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getKnex } from '../../database/db';
import { PutSurveyObject } from '../../models/survey-update';
import { queries } from '../queries';

/**
 * SQL query to update a permit row based on an old survey association.
 * Unset the survey id column (remove the association of the permit to the survey)
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const unassociatePermitFromSurveySQL = (surveyId: number): SQLStatement => {
  return SQL`
    UPDATE
      permit
    SET
      survey_id = ${null}
    WHERE
      survey_id = ${surveyId};
  `;
};

/**
 * Attempt to insert a new permit and associate the project and survey to it.
 *
 * On conflict (if the permit already exists and belongs to the project), update the permit and associate the survey
 * to it.
 *
 * @param {number} systemUserId
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} permitNumber
 * @param {string} permitType
 * @return {*}  {SQLStatement}
 */
export const insertSurveyPermitSQL = (
  systemUserId: number,
  projectId: number,
  surveyId: number,
  permitNumber: string,
  permitType: string
): SQLStatement => {
  return SQL`
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
    )
    ON CONFLICT (number) DO
    UPDATE SET
      survey_id = ${surveyId}
    WHERE
      permit.project_id = ${projectId}
    AND
      permit.survey_id is NULL;
  `;
};

/**
 * Update an existing permit by associatingF the survey to it.
 *
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} permitNumber
 * @return {*}  {(SQLStatement}
 */
export const associateSurveyToPermitSQL = (projectId: number, surveyId: number, permitNumber: string): SQLStatement => {
  return SQL`
    UPDATE
      permit
    SET
      survey_id = ${surveyId}
    WHERE
      project_id = ${projectId}
    AND
      number = ${permitNumber};
  `;
};

/**
 * Knex query builder to update a survey row.
 *
 * @param {number} surveyId
 * @param {PutSurveyObject} data
 * @returns {Knex.QueryBuilder<any, number>} knex query builder
 */
export const putSurveyDetailsSQL = (surveyId: number, data: PutSurveyObject): Knex.QueryBuilder<any, number> => {
  const knex = getKnex();

  let fieldsToUpdate = {};

  if (data.survey_details) {
    fieldsToUpdate = {
      ...fieldsToUpdate,
      name: data.survey_details.name,
      start_date: data.survey_details.start_date,
      end_date: data.survey_details.end_date,
      lead_first_name: data.survey_details.lead_first_name,
      lead_last_name: data.survey_details.lead_last_name,
      revision_count: data.survey_details.revision_count
    };
  }

  if (data.purpose_and_methodology) {
    fieldsToUpdate = {
      ...fieldsToUpdate,
      field_method_id: data.purpose_and_methodology.field_method_id,
      additional_details: data.purpose_and_methodology.additional_details,
      ecological_season_id: data.purpose_and_methodology.ecological_season_id,
      intended_outcome_id: data.purpose_and_methodology.intended_outcome_id,
      surveyed_all_areas: data.purpose_and_methodology.surveyed_all_areas,
      revision_count: data.purpose_and_methodology.revision_count
    };
  }

  if (data.location) {
    const geometrySqlStatement = SQL``;

    if (data.location.geometry && data.location.geometry.length) {
      geometrySqlStatement.append(SQL`
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

      const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(data.location.geometry);
      geometrySqlStatement.append(geometryCollectionSQL);

      geometrySqlStatement.append(SQL`
        , 4326)))
      `);
    } else {
      geometrySqlStatement.append(SQL`
        null
      `);
    }

    fieldsToUpdate = {
      ...fieldsToUpdate,
      location_name: data.location.survey_area_name,
      geojson: JSON.stringify(data.location.geometry),
      geography: knex.raw(geometrySqlStatement.sql, geometrySqlStatement.values),
      revision_count: data.location.revision_count
    };
  }

  return knex('survey').update(fieldsToUpdate).where('survey_id', surveyId);
};

