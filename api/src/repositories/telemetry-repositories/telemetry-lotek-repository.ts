import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { LotekPayload } from './telemetry-lotek-repository.interface';

/**
 * A repository class for working with raw Lotek telemetry data.
 *
 * @export
 * @class TelemetryLotekRepository
 * @extends {BaseRepository}
 */
export class TelemetryLotekRepository extends BaseRepository {
  /**
   * Create multiple Lotek telemetry records.
   *
   * @param {LotekPayload[]} telemetry - The telemetry records to create.
   * @returns {Promise<number>} The number of telemetry records created.
   */
  async createLotekTelemetry(telemetry: LotekPayload[]): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .insert(telemetry)
      .into('telemetry_lotek')
      .onConflict(['recdatetime', 'deviceid'])
      .ignore();

    const result = await this.connection.knex(queryBuilder);

    return result.rowCount ?? 0;
  }

  /**
   * Get the device activity statistics for Lotek telemetry device.
   * @returns {Promise<{ serial: number, telemetry_count: number, last_acquistion: string | null }[]>} The device activity statistics.
   */
  async getDeviceActivityStatistics() {
    const sqlStatement = SQL`
      SELECT
        deviceid as serial,
        COUNT(*)::int AS telemetry_count,
        MAX(recdatetime) as last_acquistion
      FROM telemetry_lotek
      GROUP BY serial;
    `;

    const result = await this.connection.sql(
      sqlStatement,
      z.object({ serial: z.number(), telemetry_count: z.number(), last_acquistion: z.string().nullable() })
    );

    return result.rows;
  }
}
