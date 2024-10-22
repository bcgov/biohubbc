import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import { Telemetry, TelemetrySchema, TelemetryVendorEnum } from './telemetry-vendor-repository.interface';

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
  getLotekTelemetryBaseQuery(): Knex.QueryBuilder {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_lotek.telemetry_lotek_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'deployment2.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.LOTEK}' as vendor`),
        knex.raw('telemetry_lotek.deviceid::text as serial'),
        knex.raw('telemetry_lotek.uploadtimestamp as acquisition_date'),
        'telemetry_lotek.latitude',
        'telemetry_lotek.longitude',
        'telemetry_lotek.altitude as elevation',
        'telemetry_lotek.temperature'
      )
      .from('telemetry_lotek')
      .join('deployment2', 'telemetry_lotek.device_key', 'deployment2.device_key');

    return queryBuilder;
  }

  /**
   * Get normalized `Lotek` telemetry data for list of deployment IDs.
   *
   * TODO: Add check for credentials (same method or different method?)
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number[]): Knex.QueryBuilder {
    const queryBuilder = this.getLotekTelemetryBaseQuery()
      .whereIn('deployment2.deployment2_id', deploymentIds)
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_lotek.uploadtimestamp >= deployment2.attachment_start_timestamp')
      .andWhereRaw(
        'telemetry_lotek.uploadtimestamp <= deployment2.attachment_end_timestamp OR deployment2.attachment_end_timestamp IS NULL'
      );

    return queryBuilder;
  }

  /**
   * Get normalized `Vectronic` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryBaseQuery(): Knex.QueryBuilder {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_vectronic.telemetry_vectronic_id as telemetry_id',
        'deployment2.deployment2_id as deployment_id',
        'deployment2.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.VECTRONIC}' as vendor`),
        knex.raw('telemetry_vectronic.idcollar::text as serial'),
        knex.raw('telemetry_vectronic.acquisitiontime as acquisition_date'),
        'telemetry_vectronic.latitude',
        'telemetry_vectronic.longitude',
        'telemetry_vectronic.height as elevation',
        'telemetry_vectronic.temperature'
      )
      .from('telemetry_vectronic')
      .join('deployment2', 'telemetry_vectronic.device_key', 'deployment2.device_key');

    return queryBuilder;
  }

  /**
   * Get normalized `Vectronic` telemetry data for list of deployment IDs.
   *
   * TODO: Add check for credentials (same method or different method?)
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number[]): Knex.QueryBuilder {
    const queryBuilder = this.getVectronicTelemetryBaseQuery()
      .whereIn('deployment2.deployment2_id', deploymentIds)
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_vectronic.acquisitiontime >= deployment2.attachment_start_timestamp')
      .andWhereRaw(
        'telemetry_vectronic.acquisitiontime <= deployment2.attachment_end_timestamp OR deployment2.attachment_end_timestamp IS NULL'
      );

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
        'deployment2.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.ATS}' as vendor`),
        knex.raw('telemetry_ats.collarserialnumber::text as serial'),
        'telemetry_ats.date as acquisition_date',
        'telemetry_ats.latitude',
        'telemetry_ats.longitude',
        knex.raw('NULL as elevation'),
        knex.raw('telemetry_ats.temperature::float')
      )
      .from('telemetry_ats')
      .join('deployment2', 'telemetry_ats.device_key', 'deployment2.device_key');

    return queryBuilder;
  }

  /**
   * Get normalized `ATS` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getATSTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number[]): Knex.QueryBuilder {
    const queryBuilder = this.getATSTelemetryBaseQuery()
      .whereIn('deployment2.deployment2_id', deploymentIds)
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_ats.date >= deployment2.attachment_start_timestamp')
      .andWhereRaw(
        'telemetry_ats.date <= deployment2.attachment_end_timestamp OR deployment2.attachment_end_timestamp IS NULL'
      );

    return queryBuilder;
  }

  /**
   * Get normalized `Manual` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryBaseQuery(): Knex.QueryBuilder {
    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'telemetry_manual.telemetry_manual_id as telemetry_id',
        'telemetry_manual.deployment2_id as deployment_id',
        'deployment2.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.MANUAL}' as vendor`),
        'device.serial',
        'telemetry_manual.acquisition_date',
        'telemetry_manual.latitude',
        'telemetry_manual.longitude',
        knex.raw('NULL as elevation'),
        knex.raw('NULL as temperature')
      )
      .from('telemetry_manual')
      .join('deployment2', 'telemetry_manual.deployment2_id', 'deployment2.deployment2_id')
      .join('device', 'deployment2.device_id', 'device.device_id');

    return queryBuilder;
  }

  /**
   * Get normalized `Manual` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number[]): Knex.QueryBuilder {
    const queryBuilder = this.getManualTelemetryBaseQuery()
      .whereIn('telemetry_manual.deployment2_id', deploymentIds)
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_manual.acquisition_date >= deployment2.attachment_start_timestamp')
      .andWhereRaw(
        'telemetry_manual.acquisition_date <= deployment2.attachment_end_timestamp OR deployment2.attachment_end_timestamp IS NULL'
      );

    return queryBuilder;
  }

  /**
   * Get Lotek telemetry data for list of deployment IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @param {ApiPaginationOptions} [pagination] - Pagination options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryByDeploymentIds(
    surveyId: number,
    deploymentIds: number[],
    pagination?: ApiPaginationOptions
  ): Promise<Telemetry[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (withQueryBuilder) => {
        withQueryBuilder.unionAll([
          /**
           * LOTEK Telemetry
           */
          this.getLotekTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds),
          /**
           * VECTRONIC Telemetry
           */
          this.getVectronicTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds),
          /**
           * ATS Telemetry
           */
          this.getATSTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds),
          /**
           * MANUAL Telemetry
           */
          this.getManualTelemetryByDeploymentIdsBaseQuery(surveyId, deploymentIds)
        ]);
      })
      .select('*')
      .from('telemetry');

    // Inject pagination / sorting if provided
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
