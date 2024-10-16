import { getKnex } from '../../database/db';
import { BaseRepository } from '../base-repository';
import { TelemetrySchema, TelemetryVendorEnum } from './telemetry-vendor-repository.interface';

/**
 * A repository class for working with telemetry vendor data.
 *
 * @export
 * @class TelemetryVendorRepository
 * @extends {BaseRepository}
 */
export class TelemetryVendorRepository extends BaseRepository {
  /**
   * Get normalized Lotek telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryBaseQuery() {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_lotek.telemetry_lotek_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'critter.critter_id',
        'critter.critterbase_critter_id',
        knex.raw(`'${TelemetryVendorEnum.LOTEK}' as vendor`),
        knex.raw('telemetry_lotek.deviceid::text as serial'),
        knex.raw('deployment2.attachment_start::timestamptz'),
        knex.raw('deployment2.attachment_end::timestamptz'),
        knex.raw('telemetry_lotek.uploadtimestamp::timestamptz as transmission_date'),
        'telemetry_lotek.latitude',
        'telemetry_lotek.longitude',
        'telemetry_lotek.altitude as elevation',
        'telemetry_lotek.temperature'
      )
      .from('telemetry_lotek')
      .join('deployment2', 'telemetry_lotek.device_key', 'deployment2.device_key')
      .join('critter', 'deployment2.critter_id', 'critter.critter_id');

    return queryBuilder;
  }

  /**
   * Get normalized Manual telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryBaseQuery() {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_manual.telemetry_manual_id as telemetry_id',
        'telemetry_manual.deployment2_id as deployment_id',
        'critter.critter_id',
        'critter.critterbase_critter_id',
        knex.raw(`'${TelemetryVendorEnum.MANUAL}' as vendor`),
        knex.raw('device.serial'),
        knex.raw('telemetry_manual.transmission_date'),
        'telemetry_manual.latitude',
        'telemetry_manual.longitude',
        knex.raw('NULL as elevation'),
        knex.raw('NULL as temperature')
      )
      .from('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .join('critter', 'deployment2.critter_id', 'critter.critter_id')
      .join('device', 'deployment2.device_id', 'device.device_id');

    return queryBuilder;
  }

  /**
   * Get Lotek telemetry data for list of deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @param {number} [limit] - Limit the number of telemetry records returned per deployment
   * @returns {Promise<TelemetrySchema[]>}
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[], limit?: number) {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (withQueryBuilder) => {
        withQueryBuilder.union([
          // Lotek Telemetry
          this.getLotekTelemetryBaseQuery()
            .whereIn('deployment2.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId)
            .modify((qb) => {
              if (limit) {
                qb.limit(limit);
              }
            }),
          // Manual Telemetry
          this.getManualTelemetryBaseQuery()
            .whereIn('telemetry_manual.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId)
            .modify((qb) => {
              if (limit) {
                qb.limit(limit);
              }
            })
        ]);
      })
      .select(
        'telemetry_id',
        'deployment_id',
        'critter_id',
        'critterbase_critter_id',
        'vendor',
        'serial',
        'acquisition_date',
        'latitude',
        'longitude',
        'elevation',
        'temperature'
      )
      .from('telemetry')
      .where(knex.raw('telemetry.acquisition_date >= telemetry.attachment_start'))
      .andWhere(
        knex.raw('telemetry.acquisition_date <= telemetry.attachment_start OR telemetry.attachment_end IS NULL')
      )
      .orderBy('telemetry.acquisition_date', 'desc');

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }
}
