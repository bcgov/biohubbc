import { z } from 'zod';
import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export const ObservationSubCountQualitativeMeasurementRecord = z.object({
  observation_subcount_id: z.number(),
  critterbase_measurement_qualitative_id: z.string().uuid(),
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
  critterbase_measurement_quantitative_id: z.string().uuid(),
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
  observation_subcount_id: string;
  critterbase_measurement_qualitative_id: string;
  critterbase_measurement_qualitative_option_id: string;
}
export interface InsertObservationSubCountQuantitativeMeasurementRecord {
  observation_subcount_id: string;
  critterbase_measurement_quantitative_id: string;
  value: number;
}
export class ObservationSubCountMeasurementRepository extends BaseRepository {
  async insertObservationQualitativeMeasurementRecords(
    record: InsertObservationSubCountQualitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQualitativeMeasurementRecord[]> {
    const qb = getKnex().insert(record).into('observation_subcount_qualitative_measurement').returning('*');
    const response = await this.connection.knex(qb, ObservationSubCountQualitativeMeasurementRecord);

    return response.rows;
  }

  async insertObservationQuantitativeMeasurementRecords(
    record: InsertObservationSubCountQuantitativeMeasurementRecord[]
  ): Promise<ObservationSubCountQuantitativeMeasurementRecord[]> {
    const qb = getKnex().insert(record).into('observation_subcount_quantitative_measurement').returning('*');
    const response = await this.connection.knex(qb, ObservationSubCountQuantitativeMeasurementRecord);

    return response.rows;
  }
}
