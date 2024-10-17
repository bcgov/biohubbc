import { z } from 'zod';
import { TelemetryManualRecord } from '../../database-models/telemetry_manual';
import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { CreateManualTelemetry, UpdateManualTelemetry } from './telemetry-manual-repository.interface';

/**
 * A repository class for working with Manual telemetry data.
 *
 * @export
 * @class TelemetryManualRepository
 * @extends {BaseRepository}
 */
export class TelemetryManualRepository extends BaseRepository {
  /**
   * Bulk create manual telemetry records.
   *
   * @param {number} surveyId
   * @param {CreateManualTelemetry[]} telemetry - List of manual telemetry data
   * @returns {Promise<TelemetryManualRecord[]>}
   */
  async bulkCreateManualTelemetry(
    surveyId: number,
    telemetry: CreateManualTelemetry[]
  ): Promise<TelemetryManualRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .insert(telemetry)
      .into('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .where('deployment2.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, TelemetryManualRecord);

    return response.rows;
  }

  /**
   * Bulk update manual telemetry records.
   *
   * @param {number} surveyId
   * @param {CreateManualTelemetry[]} telemetry - List of Manual telemetry data
   * @returns {Promise<TelemetryManualRecord[]>}
   */
  async bulkUpdateManualTelemetry(
    surveyId: number,
    telemetry: UpdateManualTelemetry[]
  ): Promise<TelemetryManualRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .insert(telemetry)
      .update('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .where('deployment2.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, TelemetryManualRecord);

    return response.rows;
  }

  /**
   * Bulk update manual telemetry records.
   *
   * @param {number} surveyId
   * @param {CreateManualTelemetry} telemetryManualIds - List of manual telemetry IDs
   * @returns {Promise<TelemetryManualRecord[]>}
   */
  async bulkDeleteManualTelemetry(
    surveyId: number,
    telemetryManualIds: number
  ): Promise<{ telemetry_manual_id: number }[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .delete()
      .from('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .where('telemetry_manual_id', telemetryManualIds)
      .andWhere('deployment2.survey_id', surveyId)
      .returning('telemetry_manual_id');

    const response = await this.connection.knex(queryBuilder, z.object({ telemetry_manual_id: z.number() }));

    return response.rows;
  }
}
