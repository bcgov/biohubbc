import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';
import { ApiExecuteSQLError } from '../errors/api-error';
import SQL from 'sql-template-strings';
import moment from 'moment';

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
  revision_count: z.number()
});

export type ObservationRecord = z.infer<typeof ObservationRecord>;

export type InsertObservation = Pick<
  ObservationRecord,
  'survey_id' | 'wldtaxonomic_units_id' | 'latitude' | 'longitude' | 'count' | 'observation_date' | 'observation_time'
>;

export type UpdateObservation = Pick<
  ObservationRecord,
  'survey_observation_id' | 'wldtaxonomic_units_id' | 'latitude' | 'longitude' | 'count' | 'observation_date' | 'observation_time'
>;

export class ObservationRepository extends BaseRepository {
  /**
   * TODO
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
      ) VALUES 
    `;
    
    query.append(observations.map((observation) => {
      return `(${[
        observation['survey_observation_id'] || 'NULL',
        surveyId,
        observation.wldtaxonomic_units_id,
        observation.count,
        observation.latitude,
        observation.longitude,
        `'${moment(observation.observation_date).format('YYYY-MM-DD')}'`,
        `'${observation.observation_time}'`
      ].join(', ')})`;
    }).join(', '));

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
      RETURNING *;
    `)

    console.log(query.text)
    console.log(query.values)

    const response = await this.connection.sql(query, ObservationRecord);

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to insert/update survey observations', [
        'ObservationRepository->insertUpdateSurveyObservations'
      ]);
    }

    return response.rows;

  }

  /**
   * @TODO
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
