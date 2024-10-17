import { getKnex } from '../../database/db';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import { TelemetrySchema, TelemetryVendorEnum } from './telemetry-vendor-repository.interface';

// TODO: Look at BCTW telemetry materialized view for elevation conversions
//
/**
 * A repository class for working with telemetry vendor data.
 *
 * @export
 * @class TelemetryVendorRepository
 * @extends {BaseRepository}
 */
export class TelemetryVendorRepository extends BaseRepository {
  /**
   * Get normalized `Lotek` telemetry base query.
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
        knex.raw('deployment2.attachment_start'),
        knex.raw('deployment2.attachment_end'),
        knex.raw('telemetry_lotek.uploadtimestamp as acquisition_date'),
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
   * Get normalized `Vectronic` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryBaseQuery() {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_vectronic.telemetry_vectronic_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'critter.critter_id',
        'critter.critterbase_critter_id',
        knex.raw(`'${TelemetryVendorEnum.VECTRONIC}' as vendor`),
        knex.raw('telemetry_vectronic.idcollar::text as serial'),
        knex.raw('deployment2.attachment_start'),
        knex.raw('deployment2.attachment_end'),
        knex.raw('telemetry_vectronic.acquisitiontime as acquisition_date'),
        'telemetry_vectronic.latitude',
        'telemetry_vectronic.longitude',
        'telemetry_vectronic.height as elevation',
        'telemetry_vectronic.temperature'
      )
      .from('telemetry_vectronic')
      .join('deployment2', 'telemetry_vectronic.device_key', 'deployment2.device_key')
      .join('critter', 'deployment2.critter_id', 'critter.critter_id');

    return queryBuilder;
  }

  /**
   * Get normalized `ATS` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getATSTelemetryBaseQuery() {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_ats.telemetry_ats_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'critter.critter_id',
        'critter.critterbase_critter_id',
        knex.raw(`'${TelemetryVendorEnum.ATS}' as vendor`),
        knex.raw('telemetry_ats.collarserialnumber::text as serial'),
        knex.raw('deployment2.attachment_start'),
        knex.raw('deployment2.attachment_end'),
        knex.raw('telemetry_ats.date as acquisition_date'),
        'telemetry_ats.latitude',
        'telemetry_ats.longitude',
        knex.raw('NULL as elevation'),
        knex.raw('telemetry_ats.temperature::float')
      )
      .from('telemetry_ats')
      .join('deployment2', 'telemetry_ats.device_key', 'deployment2.device_key')
      .join('critter', 'deployment2.critter_id', 'critter.critter_id');

    return queryBuilder;
  }

  /**
   * Get normalized `Manual` telemetry base query.
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
        knex.raw('deployment2.attachment_start'),
        knex.raw('deployment2.attachment_end'),
        knex.raw('telemetry_manual.acquisition_date'),
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
   * @param {ApiPaginationOptions} [pagination] - Pagination options
   * @returns {Promise<TelemetrySchema[]>}
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[], pagination?: ApiPaginationOptions) {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (withQueryBuilder) => {
        withQueryBuilder.union([
          /**
           * LOTEK TELEMETRY
           *
           * TODO: Add check for valid credentials
           */
          this.getLotekTelemetryBaseQuery()
            .whereIn('deployment2.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId),
          /**
           * VECTRONIC TELEMETRY
           *
           * TODO: Add check for valid credentials
           */
          this.getVectronicTelemetryBaseQuery()
            .whereIn('deployment2.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId),
          /**
           * ATS TELEMETRY
           *
           */
          this.getATSTelemetryBaseQuery()
            .whereIn('deployment2.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId),
          /**
           * MANUAL TELEMETRY
           *
           */
          this.getManualTelemetryBaseQuery()
            .whereIn('telemetry_manual.deployment2_id', deploymentIds)
            .andWhere('deployment2.survey_id', surveyId)
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
        knex.raw(`
          telemetry.acquisition_date <= telemetry.attachment_end
          OR
          telemetry.attachment_end IS NULL`)
      )
      .orderBy('telemetry.acquisition_date', 'desc');

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }
}
