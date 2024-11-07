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
