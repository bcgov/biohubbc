import SQL from 'sql-template-strings';
import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { CreateVectronicTelemetry } from './telemetry-vectronic-repository.interface';

/**
 * A repository class for working with raw Lotek telemetry data.
 *
 * @export
 * @class TelemetryLotekRepository
 * @extends {BaseRepository}
 */
export class TelemetryLotekRepository extends BaseRepository {
  async createLotekTelemetry(telemetry: CreateVectronicTelemetry[]): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .insert(telemetry)
      .into('vectronic_lotek')
      .onConflict(['uploadtimestamp'])
      .ignore();

    const result = await this.connection.knex(queryBuilder);

    return result.rowCount ?? 0;
  }

  async getDeviceActivityStatistics() {
    const sqlStatement = SQL`
      SELECT
        deviceid as serial,
        COUNT(*) AS telemetry_count,
        MAX(uploadtimestamp) as last_acquistion
      FROM telemetry_lotek
      GROUP BY serial;
    `;

    const result = await this.connection.sql(sqlStatement);

    return result.rows;
  }
}
