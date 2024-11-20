import { Knex } from 'knex';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import {
  Telemetry,
  TelemetryOptions,
  TelemetrySchema,
  TelemetrySpatial,
  TelemetrySpatialSchema,
  TelemetryVendorEnum
} from './telemetry-vendor-repository.interface';

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
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder
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
      .from('telemetry_lotek');
  }

  /**
   * Get normalized `Lotek` telemetry data for a survey ID.
   *
   * TODO: Add check for credentials (same method or different method?)
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getLotekTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment2', 'telemetry_lotek.device_key', 'deployment2.device_key')
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_lotek.uploadtimestamp >= deployment2.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_lotek.uploadtimestamp <= deployment2.attachment_end_timestamp')
          .orWhereRaw('deployment2.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Get normalized `Lotek` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment2.deployment2_id', deploymentIds);
  }

  /**
   * Get normalized `Lotek` telemetry data for a single telemetry ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @param {string} telemetryId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getLotekTelemetryByTelemetryIdClause(queryBuilder: Knex.QueryBuilder, telemetryId: string): Knex.QueryBuilder {
    return queryBuilder.andWhere('telemetry_lotek.telemetry_lotek_id', telemetryId);
  }

  /**
   * Get normalized `Vectronic` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder
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
      .from('telemetry_vectronic');
  }

  /**
   * Get normalized `Vectronic` telemetry data for a survey ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getVectronicTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment2', 'telemetry_vectronic.device_key', 'deployment2.device_key')
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_vectronic.acquisitiontime >= deployment2.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_vectronic.acquisitiontime <= deployment2.attachment_end_timestamp')
          .orWhereRaw('deployment2.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Get normalized `Vectronic` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryByDeploymentIdsClause(
    queryBuilder: Knex.QueryBuilder,
    deploymentIds: number[]
  ): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment2.deployment2_id', deploymentIds);
  }

  /**
   * Get normalized `Vectronic` telemetry data for a single telemetry ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} telemetryId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getVectronicTelemetryByTelemetryIdClause(queryBuilder: Knex.QueryBuilder, telemetryId: string): Knex.QueryBuilder {
    return queryBuilder.andWhere('telemetry_vectronic.telemetry_vectronic_id', telemetryId);
  }

  /**
   * Get normalized `ATS` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  getATSTelemetryBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder
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
      .from('telemetry_ats');
  }

  /**
   * Get normalized `ATS` telemetry data for a survey ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getATSTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment2', 'telemetry_ats.device_key', 'deployment2.device_key')
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_ats.date >= deployment2.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_ats.date <= deployment2.attachment_end_timestamp')
          .orWhereRaw('deployment2.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Get normalized `ATS` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getATSTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment2.deployment2_id', deploymentIds);
  }

  /**
   * Get normalized `ATS` telemetry data for a single telemetry ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} telemetryId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getATSTelemetryByTelemetryIdClause(queryBuilder: Knex.QueryBuilder, telemetryId: string): Knex.QueryBuilder {
    return queryBuilder.andWhere('telemetry_ats.telemetry_ats_id', telemetryId);
  }

  /**
   * Get normalized `Manual` telemetry base query.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder
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
  }

  /**
   * Get normalized `Manual` telemetry data for a survey ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getManualTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .andWhere('deployment2.survey_id', surveyId)
      .andWhereRaw('telemetry_manual.acquisition_date >= deployment2.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_manual.acquisition_date <= deployment2.attachment_end_timestamp')
          .orWhereRaw('deployment2.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Get normalized `Manual` telemetry data for list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment2.deployment2_id', deploymentIds);
  }

  /**
   * Get normalized `Manual` telemetry data for a single telemetry ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} telemetryId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getManualTelemetryByTelemetryIdClause(queryBuilder: Knex.QueryBuilder, telemetryId: string): Knex.QueryBuilder {
    return queryBuilder.andWhere('telemetry_manual.telemetry_manual_id', telemetryId);
  }

  /**
   * Get normalized telemetry data for all vendors for list of deployment IDs.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getTelemetryByDeploymentIdsBaseQuery(
    queryBuilder: Knex.QueryBuilder,
    surveyId: number,
    deploymentIds: number[]
  ): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder.unionAll([
      /**
       * LOTEK Telemetry
       */
      this.getLotekTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getLotekTelemetryBySurveyIdClause, surveyId)
        .modify(this.getLotekTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * VECTRONIC Telemetry
       */
      this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getVectronicTelemetryBySurveyIdClause, surveyId)
        .modify(this.getVectronicTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * ATS Telemetry
       */
      this.getATSTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getATSTelemetryBySurveyIdClause, surveyId)
        .modify(this.getATSTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * MANUAL Telemetry
       */
      this.getManualTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getManualTelemetryBySurveyIdClause, surveyId)
        .modify(this.getManualTelemetryByDeploymentIdsClause, deploymentIds)
    ]);
  }

  /**
   * Get all telemetry data for list of deployment IDs.
   *
   * Note: Currently supports, `Lotek`, `Vectronic`, `ATS`, and `Manual` telemetry.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @param {TelemetryOptions} [options] - Telemetry request options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryByDeploymentIds(
    surveyId: number,
    deploymentIds: number[],
    options?: TelemetryOptions
  ): Promise<Telemetry[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (qb) => {
        this.getTelemetryByDeploymentIdsBaseQuery(qb, surveyId, deploymentIds);
      })
      .select('*')
      .from('telemetry');

    // Inject date range if provided
    if (options?.dateRange) {
      if (options.dateRange.startDate) {
        queryBuilder.where('telemetry.acquisition_date', '>=', options.dateRange.startDate);
      }

      if (options.dateRange.endDate) {
        queryBuilder.where('telemetry.acquisition_date', '<=', options.dateRange.endDate);
      }
    }

    // Inject pagination / sorting if provided
    if (options?.pagination) {
      queryBuilder.limit(options.pagination.limit).offset((options.pagination.page - 1) * options.pagination.limit);

      if (options.pagination.sort && options.pagination.order) {
        queryBuilder.orderBy(options.pagination.sort, options.pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }

  /**
   * Get all telemetry spatial data for list of deployment IDs.
   *
   * Note: Currently supports, `Lotek`, `Vectronic`, `ATS`, and `Manual` telemetry.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<TelemetrySpatial[]>}
   */
  async getTelemetrySpatialByDeploymentIds(surveyId: number, deploymentIds: number[]): Promise<TelemetrySpatial[]> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .with('telemetry', (qb) => {
        this.getTelemetryByDeploymentIdsBaseQuery(qb, surveyId, deploymentIds);
      })
      .select(
        'telemetry.telemetry_id',
        knex.raw(`
          CASE WHEN telemetry.longitude IS NULL OR telemetry.latitude IS NULL THEN NULL 
          ELSE JSON_BUILD_OBJECT('type', 'Point', 'coordinates', JSON_BUILD_ARRAY(telemetry.longitude, telemetry.latitude)) 
          END as geometry
        `)
      )
      .from('telemetry');

    const response = await this.connection.knex(queryBuilder, TelemetrySpatialSchema);

    return response.rows;
  }

  /**
   * Get the total count of all telemetry records for list of deployment IDs.
   *
   * Note: Currently supports, `Lotek`, `Vectronic`, `ATS`, and `Manual` telemetry.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @return {*}  {Promise<number>}
   * @memberof TelemetryVendorRepository
   */
  async getTelemetryCountByDeploymentIds(surveyId: number, deploymentIds: number[]): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (qb) => {
        this.getTelemetryByDeploymentIdsBaseQuery(qb, surveyId, deploymentIds);
      })
      .select(knex.raw('count(*)::integer as count'))
      .from('telemetry');

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Get telemetry record by telemetry ID.
   *
   * @param {number} surveyId
   * @param {string} telemetryId
   * @return {*}  {Promise<Telemetry>}
   * @memberof TelemetryVendorRepository
   */
  async getTelemetryRecordById(surveyId: number, telemetryId: string): Promise<Telemetry> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (withQueryBuilder) => {
        withQueryBuilder.unionAll([
          /**
           * LOTEK Telemetry
           */
          this.getLotekTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getLotekTelemetryBySurveyIdClause, surveyId)
            .modify(this.getLotekTelemetryByTelemetryIdClause, telemetryId),
          /**
           * VECTRONIC Telemetry
           */
          this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getVectronicTelemetryBySurveyIdClause, surveyId)
            .modify(this.getVectronicTelemetryByTelemetryIdClause, telemetryId),
          /**
           * ATS Telemetry
           */
          this.getATSTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getATSTelemetryBySurveyIdClause, surveyId)
            .modify(this.getATSTelemetryByTelemetryIdClause, telemetryId),
          /**
           * MANUAL Telemetry
           */
          this.getManualTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getManualTelemetryBySurveyIdClause, surveyId)
            .modify(this.getManualTelemetryByTelemetryIdClause, telemetryId)
        ]);
      })
      .select('*')
      .from('telemetry');

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get telemetry record', [
        'TelemetryVendorRepository->getTelemetryRecordById',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }
}
