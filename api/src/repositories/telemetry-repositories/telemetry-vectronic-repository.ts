import SQL from 'sql-template-strings';
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
   * Note: This query also returns the maximum idposition (Vectronic record identifier) for each credential.
   * This allows telemetry to be fetched using the max idposition as a starting point.
   *
   * @returns {*} {Promise<ExtendedVectronicCredential[]>}
   */
  async getAllVectronicCredentials(): Promise<ExtendedVectronicCredential[]> {
    const sqlStatement = SQL`
      SELECT
        tcv.telemetry_credential_vectronic_id,
        tcv.device_key,
        tcv.idcollar,
        tcv.comtype,
        tcv.idcom,
        tcv.collarkey,
        tcv.collartype,
        MAX(tv.idposition) AS max_idposition
      FROM telemetry_credential_vectronic tcv
      LEFT JOIN telemetry_vectronic tv
        ON tv.device_key = tcv.device_key
      GROUP BY
        tcv.telemetry_credential_vectronic_id,
        tcv.device_key,
        tcv.idcollar,
        tcv.comtype,
        tcv.idcom,
        tcv.collarkey,
        tcv.collartype;
    `;
    const result = await this.connection.sql(sqlStatement, ExtendedVectronicCredential);

    return result.rows;
  }
}
