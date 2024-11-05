import SQL from 'sql-template-strings';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { CreateVectronicTelemetry } from './telemetry-vectronic-repository.interface';

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
   * Get all vectronic credentials.
   *
   * @returns {*} {Promise<TelemetryCredentialVectronicRecord[]>}
   */
  async getAllVectronicCredentials(): Promise<TelemetryCredentialVectronicRecord[]> {
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
    const result = await this.connection.sql(sqlStatement, TelemetryCredentialVectronicRecord);

    return result.rows;
  }
}
