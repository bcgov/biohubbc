import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

/**
 * Interface reflecting survey observations retrieved from the database
 */
export const ObservationRecord = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  wldtaxonomic_units_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_sample_method_id: z.number(),
  survey_sample_period_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  count: z.number(),
  observation_time: z.string(),
  observation_date: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationRecord = z.infer<typeof ObservationRecord>;

/**
 * Interface reflecting survey observations that are being inserted into the database
 */
export type InsertObservation = Pick<
  ObservationRecord,
  | 'survey_id'
  | 'wldtaxonomic_units_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_site_id'
  | 'survey_sample_method_id'
  | 'survey_sample_period_id'
>;

/**
 * Interface reflecting survey observations that are being updated in the database
 */
export type UpdateObservation = Pick<
  ObservationRecord,
  | 'survey_observation_id'
  | 'wldtaxonomic_units_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_site_id'
  | 'survey_sample_method_id'
  | 'survey_sample_period_id'
>;

export class ObservationRepository extends BaseRepository {
  /**
   * Deletes all survey observation records associated with the given survey, except
   * for records whose ID belongs to the given array, then returns the count of
   * affected rows.
   *
   * @param {number} surveyId
   * @param {number[]} retainedObservationIds Observation records to retain (not be deleted)
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsNotInArray(surveyId: number, retainedObservationIds: number[]): Promise<number> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_observation
      WHERE
        survey_id = ${surveyId}
    `;

    if (retainedObservationIds.length) {
      sqlStatement.append(`
        AND
          survey_observation_id
        NOT IN
          (${retainedObservationIds.join(',')})
      `);
    }

    sqlStatement.append(';');

    const response = await this.connection.sql(sqlStatement);

    return response.rowCount;
  }

  /**
   * Performs an upsert for all observation records belonging to the given survey, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((InsertObservation | UpdateObservation)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    if (!observations.length) {
      // no observations to create or update, leave early
      return [];
    }
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation
      (
        survey_observation_id,
        survey_id,
        wldtaxonomic_units_id,
        survey_sample_site_id,
        survey_sample_method_id,
        survey_sample_period_id,
        count,
        latitude,
        longitude,
        observation_date,
        observation_time
      )
      OVERRIDING SYSTEM VALUE
      VALUES 
    `;

    sqlStatement.append(
      observations
        .map((observation) => {
          return `(${[
            observation['survey_observation_id'] || 'DEFAULT',
            surveyId,
            observation.wldtaxonomic_units_id,
            observation.survey_sample_site_id,
            observation.survey_sample_method_id,
            observation.survey_sample_period_id,
            observation.count,
            observation.latitude,
            observation.longitude,
            `'${observation.observation_date}'`,
            `'${observation.observation_time}'`
          ].join(', ')})`;
        })
        .join(', ')
    );

    sqlStatement.append(`
      ON CONFLICT
        (survey_observation_id)
      DO UPDATE SET
        wldtaxonomic_units_id = EXCLUDED.wldtaxonomic_units_id,
        survey_sample_site_id = EXCLUDED.survey_sample_site_id,
        survey_sample_method_id = EXCLUDED.survey_sample_method_id,
        survey_sample_period_id = EXCLUDED.survey_sample_period_id,
        count = EXCLUDED.count,
        observation_date = EXCLUDED.observation_date,
        observation_time = EXCLUDED.observation_time,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude
    `);

    sqlStatement.append(`
      RETURNING*;
    `);
    const response = await this.connection.sql(sqlStatement, ObservationRecord);

    return response.rows;
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    const knex = getKnex();
    const sqlStatement = knex.queryBuilder().select('*').from('survey_observation').where('survey_id', surveyId);

    const response = await this.connection.knex(sqlStatement, ObservationRecord);
    return response.rows;
  }
}
