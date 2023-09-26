import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export const ObservationRecord = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  wldtaxonomic_units_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  count: z.number(),
  observation_datetime: z.string(),
  create_date: z.string(),
  revision_count: z.number()
});

export type ObservationRecord = z.infer<typeof ObservationRecord>;

export type InsertObservation = Pick<
  ObservationRecord,
  'survey_id' | 'wldtaxonomic_units_id' | 'latitude' | 'longitude' | 'count' | 'observation_datetime'
>;

export type UpdateObservation = Pick<
  ObservationRecord,
  'survey_observation_id' | 'wldtaxonomic_units_id' | 'latitude' | 'longitude' | 'count' | 'observation_datetime'
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
    const knex = getKnex();

    const query = knex.queryBuilder()
      .insert(
        observations.map((observation) => {
          return {
            survey_id: surveyId,
            ...observation
            /*
              survey_observation_id: observation['survey_observation_id'],
              wldtaxonomic_units_id: observation.wldtaxonomic_units_id,
              count: observation.count,
              observation_datetime: observation.observation_datetime,
              latlong: knex.raw(`POINT(${observation.latitude}, ${observation.longitude})`)
            */
          };
        })
      )
      .into('survey_observation')
      .onConflict(`
        (survey_observation_id)
        DO UPDATE SET
          wldtaxonomic_units_id = EXCLUDED.wldtaxonomic_units_id,
          count = EXCLUDED.count,
          observation_datetime = EXCLUDED.observation_datetime,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
        RETURNING *;
      `)
    
      console.log('query:', String(JSON.stringify(query)));

    /*
    const response = await this.connection.query(query, ObservationRecord);

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to insert/update survey observations', [
        'ObservationRepository->insertUpdateSurveyObservations'
      ]);
    }

    return response.rows;
    */
    return [];
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
