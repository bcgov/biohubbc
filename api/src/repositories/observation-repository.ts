import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';

export const ObservationRecord = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  wldtaxonomic_units_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  count: z.number(),    
  observation_datetime: z.string(),
  create_date: z.string(),
  revision_count: z.number(),
});

export type ObservationRecord = z.infer<typeof ObservationRecord>;

export type InsertObservation = Pick<ObservationRecord,
  | 'survey_id'
  | 'wldtaxonomic_units_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_datetime'
>;

export type UpdateObservation = Pick<ObservationRecord,
  | 'survey_id'
  | 'survey_observation_id'
  | 'wldtaxonomic_units_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_datetime'
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
  async insertUpdateSurveyObservations(surveyId: number, observations: (InsertObservation | UpdateObservation)[]): Promise<ObservationRecord[]> {
    const insertQuery = getKnex()
      .insert(observations)
      .into('survey_observation')
      .onConflict('survey_observation_pk')
      .merge()
      .returning('*')

    const response = await this.connection.knex(insertQuery, ObservationRecord);

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
    const selectQuery = getKnex()
      .select('*')
      .from('survey_observation')
      .where('survey_id', surveyId)

    const response = await this.connection.knex(selectQuery, ObservationRecord);
    return response.rows;
  }

}
