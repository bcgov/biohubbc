import SQL from 'sql-template-strings';
import { z } from 'zod';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import { IKeyxData, VectronicPayload } from './telemetry-vectronic-repository.interface';

/**
 * A repository class for working with raw vectronic telemetry data.
 *
 * @export
 * @class TelemetryVectronicRepository
 * @extends {BaseRepository}
 */
export class TelemetryVectronicRepository extends BaseRepository {
  async createVectronicTelemetry(telemetry: VectronicPayload[]): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .insert(telemetry)
      .into('telemetry_vectronic')
      .onConflict('idposition')
      .ignore();

    const result = await this.connection.knex(queryBuilder);

    return result.rowCount ?? 0;
  }

  /**
   * Get all Vectronic credentials.
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

  /**
   * Insert Vectronic device key data
   *
   * @async
   * @param {IKeyxData} key
   * @returns {Promise<number>}
   */
  async insertTelemetryCredentialAttachmentVectronic(key: IKeyxData): Promise<number> {
    const sqlStatement = SQL`
      WITH ins_key AS (
        INSERT INTO telemetry_credential_vectronic (
          idcollar,
          comtype,
          idcom,
          collarkey,
          collartype
        ) VALUES (
          ${key.id},
          ${key.comType},
          ${key.comID},
          ${key.key},
          ${key.collarType}
        )
        ON CONFLICT (device_key)
        DO NOTHING
        RETURNING
          telemetry_credential_vectronic_id
      )
      SELECT COALESCE((SELECT telemetry_credential_vectronic_id FROM ins_key), 0) AS telemetry_credential_vectronic_id;
      `;

    const responseVectronic = await this.connection.sql(
      sqlStatement,
      z.object({ telemetry_credential_vectronic_id: z.number() })
    );

    if (!responseVectronic?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert vectronic device key data', [
        'AttachmentRepository->insertTelemetryCredentialAttachmentVectronic',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return responseVectronic?.rows?.[0].telemetry_credential_vectronic_id;
  }
}
