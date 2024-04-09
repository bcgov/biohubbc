import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export const ObservationSubCountQualitativeMeasurementRecord = z.object({
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

  async deleteObservationMeasurements(surveyId: number, surveyObservationId: number[]) {
    await this.deleteObservationQualitativeMeasurementRecordsForSurveyObservationIds(surveyObservationId, surveyId);
    await this.deleteObservationQuantitativeMeasurementRecordsForSurveyObservationIds(surveyObservationId, surveyId);
  }

  /**
   * Get all distinct taxon_measurment_ids for all qualitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async getObservationSubCountQualitativeTaxonMeasurementIds(surveyId: number): Promise<string[]> {
    const sqlStatement = SQL`
      SELECT
        DISTINCT critterbase_taxon_measurement_id
      FROM
        observation_subcount_qualitative_measurement
      WHERE
        observation_subcount_id in (
          select
            observation_subcount_id
          FROM
            observation_subcount
          WHERE
            survey_observation_id in (
              SELECT
                survey_observation_id
              FROM
                survey_observation
              WHERE
                survey_id = ${surveyId}
            )
        )
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows.map((item) => item.critterbase_taxon_measurement_id);
  }

  /**
   * Get all distinct taxon_measurment_ids for all quantitative measurements for a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<string[]>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async getObservationSubCountQuantitativeTaxonMeasurementIds(surveyId: number): Promise<string[]> {
    const sqlStatement = SQL`
      SELECT
        DISTINCT critterbase_taxon_measurement_id
      FROM
        observation_subcount_quantitative_measurement
      WHERE
        observation_subcount_id in (
          select
            observation_subcount_id
          FROM
            observation_subcount
          WHERE
            survey_observation_id in (
              SELECT
                survey_observation_id
              FROM
                survey_observation
              WHERE
                survey_id = ${surveyId}
            )
        )
    `;

    const response = await this.connection.sql(sqlStatement);

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
   * Delete all measurement records, for all observation records, for a given survey and set of measurement ids.
   *
   * @param {number} surveyId
   * @param {string[]} measurementIds Critterbase taxon measurement ids to delete
   * @return {*}  {Promise<void>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteMeasurementsForTaxonMeasurementIds(surveyId: number, measurementIds: string[]): Promise<void> {
    await this.deleteQualitativeMeasurementForTaxonMeasurementIds(surveyId, measurementIds);
    await this.deleteQuantitativeMeasurementForTaxonMeasurementIds(surveyId, measurementIds);
  }

  /**
   * Delete all qualitative measurement records, for all observation records, for a given survey and set of measurement
   * ids.
   *
   * @param {number} surveyId
   * @param {string[]} measurementIds Critterbase taxon measurement ids to delete.
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteQualitativeMeasurementForTaxonMeasurementIds(
    surveyId: number,
    measurementIds: string[]
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
      .whereIn('observation_subcount_qualitative_measurement.critterbase_taxon_measurement_id', measurementIds);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }

  /**
   * Delete all quantitative measurement records, for all observation records, for a given survey and set of measurement
   * ids.
   *
   * @param {number} surveyId
   * @param {string[]} measurementIds Critterbase taxon measurement ids to delete.
   * @return {*}  {Promise<number>}
   * @memberof ObservationSubCountMeasurementRepository
   */
  async deleteQuantitativeMeasurementForTaxonMeasurementIds(
    surveyId: number,
    measurementIds: string[]
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
      .whereIn('observation_subcount_quantitative_measurement.critterbase_taxon_measurement_id', measurementIds);

    const response = await this.connection.knex(qb);

    return response.rowCount ?? 0;
  }
}
