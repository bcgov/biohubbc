import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { CreateVectronicTelemetry, ExtendedVectronicCredential } from './telemetry-vectronic-repository.interface';

/**
 * A repository class for working with raw vectronic telemetry data.
 *
 * @export
 * @class TelemetryVectronicRepository
 * @extends {BaseRepository}
 */
export class TelemetryVectronicRepository extends BaseRepository {
  async createVectronicTelemetry(telemetry: CreateVectronicTelemetry[]): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .insert(telemetry)
      .into('vectronic_telemetry')
      .onConflict('idposition')
      .ignore();

    const result = await this.connection.knex(queryBuilder);

    return result.rowCount ?? 0;
  }

  /**
   * Get all Vectronic credentials.
   *
   * @returns {*} {Promise<ExtendedVectronicCredential[]>}
   */
  async getAllVectronicCredentials(): Promise<ExtendedVectronicCredential[]> {
    const sqlStatement = SQL`
      SELECT
        telemetry_credential_vectronic_id,
        device_key,
        idcollar,
        comtype,
        idcom,
        collarkey,
        collartype
        FROM telemetry_credential_vectronic;
    `;
    const result = await this.connection.sql(sqlStatement, ExtendedVectronicCredential);

    return result.rows;
  }

  async getDeviceActivityStatistics() {
    const sqlStatement = SQL`
      SELECT
        idcollar as serial,
        COUNT(*)::int AS telemetry_count,
        MAX(idposition) as max_idposition
      FROM
        telemetry_vectronic
      GROUP BY
        idcollar;
    `;

    const result = await this.connection.sql(
      sqlStatement,
      z.object({ serial: z.number(), telemetry_count: z.number(), max_idposition: z.number().nullable() })
    );

    return result.rows;
  }
}
