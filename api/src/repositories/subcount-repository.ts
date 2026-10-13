import { z } from 'zod';
import { ObservationSubcountModel, ObservationSubcountRecord } from '../database-models/observation_subcount';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export type InsertObservationSubCount = Pick<
  ObservationSubcountRecord,
  'survey_observation_id' | 'subcount' | 'comment' | 'critterbase_critter_id'
>;

export interface InsertSubCount {
  observation_subcount_id: number | null;
  comment: string | null;
  subcount: number;
  critterbase_critter_id: string | null;
  qualitative_measurements: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  quantitative_measurements: {
    measurement_id: string;
    measurement_value: number;
  }[];
}

export class SubCountRepository extends BaseRepository {
  /**
   * Inserts a new observation_subcount record
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubcountModel>}
   * @memberof SubCountRepository
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubcountModel> {
    const queryBuilder = getKnex().insert(record).into('observation_subcount').returning('*');

    const response = await this.connection.knex(queryBuilder, ObservationSubcountModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation subcount', [
        'SubCountRepository->insertObservationSubCount',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete observation subcount records for the given set of observation subcount ids, and dependent records.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<number[]>} The parent survey observation record ids that had subcount records deleted
   * @memberof SubCountRepository
   */
  async deleteObservationSubcountRecords(surveyId: number, observationSubcountIds: number[]): Promise<number[]> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .delete()
      .from('observation_subcount')
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.observation_subcount_id', observationSubcountIds)
      .andWhere('survey_observation.survey_id', surveyId)
      .returning('survey_observation.survey_observation_id');

    const response = await this.connection.knex(queryBuilder, z.object({ survey_observation_id: z.number() }));

    return response.rows.map((row) => row.survey_observation_id);
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountRepository
   */
  async deleteObservationSubCountRecordsByObservationId(
    surveyId: number,
    surveyObservationIds: number[]
  ): Promise<void> {
    const queryBuilder = getKnex()
      .delete()
      .from('observation_subcount')
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    // Delete observation_subcount records, if any
    await this.connection.knex(queryBuilder);
  }
}
