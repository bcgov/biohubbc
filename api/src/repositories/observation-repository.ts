import moment from 'moment';
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
  'survey_id' | 'wldtaxonomic_units_id' | 'latitude' | 'longitude' | 'count' | 'observation_date' | 'observation_time'
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
>;

export class ObservationRepository extends BaseRepository {
  /**
   * Deletes all survey observation records associated with the given survey, except
   * for records whose ID belongs to the given array, then returns the count of
   * affected rows.
   * 
   * @param surveyId 
   * @param retainedObservationIds 
   */
  async deleteObservationsNotInArray(surveyId: number, retainedObservationIds: number[]): Promise<number> {
    const query = SQL`
      DELETE FROM
        survey_observation
      WHERE
        survey_id = ${surveyId}
      AND
        survey_observation_id
      NOT IN
    `;

    query.append(`(${retainedObservationIds.join(',')})`);

    const response = await this.connection.sql(query);

    return response.rowCount;
  }

  /**
   * Performs an upsert for all observation records belonging to the given survey, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    const query = SQL`
      INSERT INTO
        survey_observation
      (
        survey_observation_id,
        survey_id,
        wldtaxonomic_units_id,
        count,
        latitude,
        longitude,
        observation_date,
        observation_time
      )
      OVERRIDING SYSTEM VALUE
      VALUES 
    `;

    query.append(
      observations
        .map((observation) => {
          return `(${[
            observation['survey_observation_id'] || 'DEFAULT',
            surveyId,
            observation.wldtaxonomic_units_id,
            observation.count,
            observation.latitude,
            observation.longitude,
            `'${moment(observation.observation_date).format('YYYY-MM-DD')}'`,
            `'${observation.observation_time}'`
          ].join(', ')})`;
        })
        .join(', ')
    );

    query.append(`
      ON CONFLICT
        (survey_observation_id)
      DO UPDATE SET
        wldtaxonomic_units_id = EXCLUDED.wldtaxonomic_units_id,
        count = EXCLUDED.count,
        observation_date = EXCLUDED.observation_date,
        observation_time = EXCLUDED.observation_time,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude
    `);

    query.append(`RETURNING *;`);

    const response = await this.connection.sql(query, ObservationRecord);

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
    const selectQuery = getKnex().select('*').from('survey_observation').where('survey_id', surveyId);

    const response = await this.connection.knex(selectQuery, ObservationRecord);
    return response.rows;
  }
}
