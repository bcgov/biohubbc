import { TelemetryManualRecord } from '../../database-models/telemetry_manual';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import { CreateManualTelemetry } from './telemetry-manual-repository.interface';

/**
 * A repository class for working with Manual telemetry data.
 *
 * @export
 * @class TelemetryManualRepository
 * @extends {BaseRepository}
 */
export class TelemetryManualRepository extends BaseRepository {
  /**
   * Get manual telemetry records by their IDs.
   *
   * @param {number} surveyId - The survey ID
   * @param {string[]} telemetryManualIds - List of manual telemetry IDs
   * @returns {Promise<TelemetryManualRecord[]>}
   */
  async getManualTelemetryByIds(surveyId: number, telemetryManualIds: string[]): Promise<TelemetryManualRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select('*')
      .from('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .whereIn('telemetry_manual.telemetry_manual_id', telemetryManualIds)
      .andWhere('deployment2.survey_id', surveyId);

    const response = await this.connection.knex<TelemetryManualRecord>(queryBuilder);

    return response.rows;
  }
  /**
   * Bulk create manual telemetry records.
   *
   * Note: Deployment IDs need to be pre-validated against the survey ID in the service.
   *
   * @param {CreateManualTelemetry[]} telemetry - List of manual telemetry data to create
   * @returns {Promise<void>}
   */
  async bulkCreateManualTelemetry(telemetry: CreateManualTelemetry[]): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex.insert(telemetry).into('telemetry_manual');

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== telemetry.length) {
      throw new ApiExecuteSQLError('Failed to create manual telemetry records', [
        'TelemetryManualRepository->bulkCreateManualTelemetry',
        `expected rowCount to be ${telemetry.length}, got ${response.rowCount}`
      ]);
    }
  }

  /**
   * Bulk update manual telemetry records.
   *
   * Note: Deployment IDs need to be pre-validated against the survey ID in the service.
   *
   * @param {TelemetryManualRecord[]} telemetry - List of Manual telemetry data to update
   * @returns {Promise<void>}
   */
  async bulkUpdateManualTelemetry(telemetry: TelemetryManualRecord[]): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex
      .insert(telemetry)
      .into('telemetry_manual')
      .onConflict('telemetry_manual_id')
      // intentionally omitting the deployment_id
      .merge(['latitude', 'longitude', 'acquisition_date', 'transmission_date']);

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== telemetry.length) {
      throw new ApiExecuteSQLError('Failed to update manual telemetry records', [
        'TelemetryManualRepository->bulkUpdateManualTelemetry',
        `expected rowCount to be ${telemetry.length}, got ${response.rowCount}`
      ]);
    }
  }

  /**
   * Bulk delete manual telemetry records.
   *
   * Note: Deployment IDs need to be pre-validated against the survey ID in the service.
   *
   * @param {string} telemetryManualIds - List of manual telemetry IDs
   * @returns {Promise<void>}
   */
  async bulkDeleteManualTelemetry(telemetryManualIds: string[]): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex.delete().from('telemetry_manual').whereIn('telemetry_manual_id', telemetryManualIds);

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== telemetryManualIds.length) {
      throw new ApiExecuteSQLError('Failed to delete manual telemetry records', [
        'TelemetryManualRepository->bulkDeleteManualTelemetry',
        `expected rowCount to be ${telemetryManualIds.length}, got ${response.rowCount}`
      ]);
    }
  }
}
