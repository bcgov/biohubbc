import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import { ICfgData, LotekPayload } from './telemetry-lotek-repository.interface';

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
   * @returns {Promise<{ serial: number, telemetry_count: number, last_acquisition: string | null }[]>} The device activity statistics.
   */
  async getDeviceActivityStatistics() {
    const sqlStatement = SQL`
      SELECT
        deviceid as serial,
        COUNT(*)::int AS telemetry_count,
        MAX(recdatetime) as last_acquisition
      FROM telemetry_lotek
      GROUP BY serial;
    `;

    const result = await this.connection.sql(
      sqlStatement,
      z.object({ serial: z.number(), telemetry_count: z.number(), last_acquisition: z.string().nullable() })
    );

    return result.rows;
  }

  /**
   * Insert Lotek device key data
   *
   * @async
   * @param {ICfgData} key
   * @returns {Promise<number>}
   */
  async insertTelemetryCredentialLotek(key: ICfgData): Promise<number> {
    const sqlStatement = SQL`
      WITH ins_key AS (
        INSERT INTO telemetry_credential_lotek (
          ndeviceid,
          strspecialid,
          key
        ) VALUES (
          ${key.id},
          ${key.satelliteId},
          ${key.key}
        )
        ON CONFLICT (device_key)
        DO NOTHING
        RETURNING
          telemetry_credential_lotek_id
      )
      SELECT COALESCE((SELECT telemetry_credential_lotek_id FROM ins_key), 0) AS telemetry_credential_lotek_id;
      `;

    const responseLotek = await this.connection.sql(
      sqlStatement,
      z.object({ telemetry_credential_lotek_id: z.number() })
    );

    if (!responseLotek?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert lotek device key data', [
        'AttachmentRepository->insertTelemetryCredentialLotek',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return responseLotek?.rows?.[0].telemetry_credential_lotek_id;
  }
}
