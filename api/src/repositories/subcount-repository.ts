import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const ObservationSubCountRecord = z.object({
  observation_subcount_id: z.number(),
  survey_observation_id: z.number(),
  subcount: z.number().nullable(),
  observation_subcount_sign_id: z.number().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountRecord = z.infer<typeof ObservationSubCountRecord>;
export type InsertObservationSubCount = Pick<
  ObservationSubCountRecord,
  'survey_observation_id' | 'subcount' | 'observation_subcount_sign_id'
>;

export const SubCountEventRecord = z.object({
  subcount_event_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_event_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SubCountEventRecord = z.infer<typeof SubCountEventRecord>;
export type InsertSubCountEvent = Pick<SubCountEventRecord, 'observation_subcount_id' | 'critterbase_event_id'>;

export const SubCountCritterRecord = z.object({
  subcount_critter_id: z.number(),
  observation_subcount_id: z.number(),
  critter_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SubCountCritterRecord = z.infer<typeof SubCountCritterRecord>;

export class SubCountRepository extends BaseRepository {
  /**
   * Inserts a new observation_subcount record
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubCountRecord>}
   * @memberof SubCountRepository
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    const queryBuilder = getKnex().insert(record).into('observation_subcount').returning('*');

    const response = await this.connection.knex(queryBuilder, ObservationSubCountRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation subcount', [
        'SubCountRepository->insertObservationSubCount',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new subcount_event record.
   *
   * @param {InsertSubCountEvent} record
   * @returns {*} {Promise<SubCountEventRecord>}
   * @memberof SubCountRepository
   */
  async insertSubCountEvent(record: InsertSubCountEvent): Promise<SubCountEventRecord> {
    const queryBuilder = getKnex().insert(record).into('subcount_event').returning('*');

    const response = await this.connection.knex(queryBuilder, SubCountEventRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert subcount event', [
        'SubCountRepository->insertSubCountEvent',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new subcount_critter record.
   *
   * @param {SubCountCritterRecord} subcountCritter
   * @return {*}  {Promise<SubCountCritterRecord>}
   * @memberof SubCountRepository
   */
  async insertSubCountCritter(subcountCritter: SubCountCritterRecord): Promise<SubCountCritterRecord> {
    const queryBuilder = getKnex().insert(subcountCritter).into('subcount_critter').returning('*');

    const response = await this.connection.knex(queryBuilder, SubCountCritterRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert subcount critter', [
        'SubCountRepository->insertSubCountCritter',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountRepository
   */
  async deleteObservationSubCountRecords(surveyId: number, surveyObservationIds: number[]): Promise<void> {
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

  /**
   * Delete subcount_event records for the given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}
   * @memberof SubCountRepository
   */
  async deleteSubCountEventRecordsForObservationId(surveyId: number, surveyObservationIds: number[]) {
    const queryBuilder = getKnex()
      .delete()
      .from('subcount_event')
      .innerJoin(
        'observation_subcount',
        'observation_subcount.observation_subcount_id',
        'subcount_event.observation_subcount_id'
      )
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    return this.connection.knex(queryBuilder);
  }

  /**
   * Delete subcount_critter records for a given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}
   * @memberof SubCountRepository
   */
  async deleteSubCountCritterRecordsForObservationId(surveyId: number, surveyObservationIds: number[]) {
    const queryBuilder = getKnex()
      .delete()
      .from('subcount_critter')
      .innerJoin(
        'observation_subcount',
        'observation_subcount.observation_subcount_id',
        'subcount_critter.observation_subcount_id'
      )
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    return this.connection.knex(queryBuilder);
  }
}
