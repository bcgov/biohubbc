import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export const ObservationSubCountQualitativeMeasurementRecord = z.object({
  observation_subcount_qualitative_measurement_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_taxon_measurement_id: z.string().uuid(),
  critterbase_measurement_qualitative_option_id: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountQualitativeMeasurementRecord = z.infer<
  typeof ObservationSubCountQualitativeMeasurementRecord
>;

export const ObservationSubCountQuantitativeMeasurementRecord = z.object({
  observation_subcount_quantitative_measurement_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_taxon_measurement_id: z.string().uuid(),
  value: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountQuantitativeMeasurementRecord = z.infer<
  typeof ObservationSubCountQuantitativeMeasurementRecord
>;

export interface InsertObservationSubCountQualitativeMeasurementRecord {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  critterbase_measurement_qualitative_option_id: string;
}
export interface InsertObservationSubCountQuantitativeMeasurementRecord {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  value: number;
}

export class ObservationSubCountMeasurementRepository extends BaseRepository {
  async insertObservationQualitativeMeasurementRecords(
    record: InsertObservationSubCountQualitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQualitativeMeasurementRecord[]> {
    const qb = getKnex()
      .queryBuilder()
      .insert(record)
      .into('observation_subcount_qualitative_measurement')
      .returning('*');
    const response = await this.connection.knex(qb, ObservationSubCountQualitativeMeasurementRecord);

    return response.rows;
  }

  async insertObservationQuantitativeMeasurementRecords(
    record: InsertObservationSubCountQuantitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQuantitativeMeasurementRecord[]> {
    const qb = getKnex()
      .queryBuilder()
      .insert(record)
      .into('observation_subcount_quantitative_measurement')
      .returning('*');
    const response = await this.connection.knex(qb, ObservationSubCountQuantitativeMeasurementRecord);

    return response.rows;
  }

  /**
   * Deletes all observation measurements for a given survey and set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationId
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteObservationMeasurements(surveyId: number, surveyObservationId: number[]) {
    await this.deleteObservationQualitativeMeasurementRecordsForSurveyObservationIds(surveyObservationId, surveyId);
    await this.deleteObservationQuantitativeMeasurementRecordsForSurveyObservationIds(surveyObservationId, surveyId);
  }

  /**
   * Get all distinct taxon_measurment_ids for all qualitative measurements for a given survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async getObservationSubCountQualitativeTaxonMeasurementIds(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<string[]> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .distinct('critterbase_taxon_measurement_id')
      .from('observation_subcount_qualitative_measurement')
      .whereIn('observation_subcount_id', (qb1) => {
        qb1
          .select('observation_subcount_id')
          .from('observation_subcount')
          .whereIn('survey_observation_id', (qb2) => {
            qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', surveyIds);

            if (options?.filterFields?.surveyObservationIds) {
              qb2.whereIn('survey_observation_id', options.filterFields.surveyObservationIds);
            }
          });
      });

    const response = await this.connection.knex(
      query,
      z.object({ critterbase_taxon_measurement_id: z.string().uuid() })
    );

    return response.rows.map((item) => item.critterbase_taxon_measurement_id);
  }

  /**
   * Get all distinct taxon_measurment_ids for all quantitative measurements for a given survey.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *     }} [options] Optional fields to additionally filter results by
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async getObservationSubCountQuantitativeTaxonMeasurementIds(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
    }
  ): Promise<string[]> {
    const knex = getKnex();

    const query = knex.queryBuilder();

    query
      .distinct('critterbase_taxon_measurement_id')
      .from('observation_subcount_quantitative_measurement')
      .whereIn('observation_subcount_id', (qb1) => {
        qb1
          .select('observation_subcount_id')
          .from('observation_subcount')
          .whereIn('survey_observation_id', (qb2) => {
            qb2.select('survey_observation_id').from('survey_observation').whereIn('survey_id', surveyIds);

            if (options?.filterFields?.surveyObservationIds) {
              qb2.whereIn('survey_observation_id', options.filterFields.surveyObservationIds);
            }
          });
      });

    const response = await this.connection.knex(
      query,
      z.object({ critterbase_taxon_measurement_id: z.string().uuid() })
    );

    return response.rows.map((item) => item.critterbase_taxon_measurement_id);
  }

  async deleteObservationQualitativeMeasurementRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_qualitative_measurement')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_qualitative_measurement.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere(`survey_observation.survey_id`, surveyId)
      .whereIn('survey_observation.survey_observation_id', surveyObservationId);
    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  async deleteObservationQuantitativeMeasurementRecordsForSurveyObservationIds(
    surveyObservationId: number[],
    surveyId: number
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_quantitative_measurement')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_quantitative_measurement.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .andWhere(`survey_observation.survey_id`, surveyId)
      .whereIn('survey_observation.survey_observation_id', surveyObservationId);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all qualitative and quantitative measurement records for a given survey and set of observation subcount ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteMeasurementsByObservationSubCountId(surveyId: number, observationSubcountIds: number[]): Promise<void> {
    await Promise.all([
      this.deleteQualitativeMeasurementsByObservationSubcountIds(surveyId, observationSubcountIds),
      this.deleteQuantitativeMeasurementsByObservationSubcountIds(surveyId, observationSubcountIds)
    ]);
  }

  /**
   * Delete all qualitative measurement records, for all observation records, for a given survey and set of measurement
   * ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteQualitativeMeasurementsByObservationSubcountIds(
    surveyId: number,
    observationSubcountIds: number[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_qualitative_measurement')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_qualitative_measurement.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .where('survey_observation.survey_id', surveyId)
      .whereIn('observation_subcount.observation_subcount_id', observationSubcountIds);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all quantitative measurement records, for all observation records, for a given survey and set of measurement
   * ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteQuantitativeMeasurementsByObservationSubcountIds(
    surveyId: number,
    observationSubcountIds: number[]
  ): Promise<number> {
    const qb = getKnex()
      .queryBuilder()
      .delete()
      .from('observation_subcount_quantitative_measurement')
      .using(['observation_subcount', 'survey_observation'])
      .whereRaw(
        'observation_subcount_quantitative_measurement.observation_subcount_id = observation_subcount.observation_subcount_id'
      )
      .whereRaw('observation_subcount.survey_observation_id = survey_observation.survey_observation_id')
      .where('survey_observation.survey_id', surveyId)
      .whereIn('observation_subcount.observation_subcount_id', observationSubcountIds);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }
}
