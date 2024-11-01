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
  async createVectronicTelemetry(telemetry: CreateVectronicTelemetry[]): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .insert(telemetry)
      .into('vectronic_telemetry')
      .onConflict('idposition')
      .ignore();

    await this.connection.knex(queryBuilder);
  }
}
