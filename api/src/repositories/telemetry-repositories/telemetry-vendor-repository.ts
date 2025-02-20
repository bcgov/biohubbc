import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IAllTelemetryAdvancedFilters } from '../../models/telemetry-view';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
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
        'deployment.deployment_id as deployment_id',
        'deployment.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.LOTEK}' as vendor`),
        knex.raw('telemetry_lotek.deviceid::text as serial'),
        knex.raw('telemetry_lotek.recdatetime as acquisition_date'),
        'telemetry_lotek.latitude',
        'telemetry_lotek.longitude',
        'telemetry_lotek.altitude as elevation',
        'telemetry_lotek.temperature'
      )
      .from('telemetry_lotek');
  }

  /**
   * Add where clause to filter `Lotek` telemetry data by device attachment date range.
   *
   * Note: Joins the `deployment` table.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getLotekTelemetryByAttachmentDateRangeClause(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment', 'telemetry_lotek.device_key', 'deployment.device_key')
      .andWhereRaw('telemetry_lotek.recdatetime >= deployment.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_lotek.recdatetime <= deployment.attachment_end_timestamp')
          .orWhereRaw('deployment.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Add where clause to filter `Lotek` telemetry data by a survey ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getLotekTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder.andWhere('deployment.survey_id', surveyId);
  }

  /**
   * Add join to filter Lotek telemetry data that has a valid credential key
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryByCredentialClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .join(
        'survey_telemetry_vendor_credential',
        'telemetry_lotek.device_key',
        'survey_telemetry_vendor_credential.device_key'
      )
      .andWhere('survey_telemetry_vendor_credential.survey_id', surveyId);
  }

  /**
   * Add where clause to filter `Lotek` telemetry data by a list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getLotekTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment.deployment_id', deploymentIds);
  }

  /**
   * Add where clause to filter `Lotek` telemetry data by a telemetry ID.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} telemetryId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getLotekTelemetryByTelemetryIdClause(queryBuilder: Knex.QueryBuilder, telemetryId: string): Knex.QueryBuilder {
    return queryBuilder.andWhere('telemetry_lotek.telemetry_lotek_id', telemetryId);
  }

  /**
   * Find `Lotek` telemetry data records the user has access to, based on filters and pagination options.
   *
   * Checks for vendor credentials.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findLotekTelemetryClause(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    queryBuilder.join('survey', 'deployment.survey_id', 'survey.survey_id');

    if (!isUserAdmin) {
      // If the user is not an admin, filter results by vendor credentials
      queryBuilder.join(
        'survey_telemetry_vendor_credential',
        'survey.survey_id',
        'survey_telemetry_vendor_credential.survey_id'
      );
      // If the user is not an admin, filter results by the projects/surveys they have access to
      queryBuilder
        .join('project_participation', 'survey.project_id', 'project_participation.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    if (filterFields.keyword) {
      // Keyword Search filter
      const keywordMatch = `%${filterFields.keyword}%`;
      queryBuilder.where((subQueryBuilder) => {
        subQueryBuilder
          .where(knex.raw(`'${TelemetryVendorEnum.LOTEK}'`), 'ilike', keywordMatch)
          .orWhere(knex.raw('telemetry_lotek.deviceid::text'), 'ilike', keywordMatch);
      });
    }

    if (filterFields.start_date) {
      queryBuilder.where('telemetry_lotek.recdatetime', '>=', filterFields.start_date);
    }

    if (filterFields.end_date) {
      queryBuilder.where('telemetry_lotek.recdatetime', '<=', filterFields.end_date);
    }

    if (filterFields.system_user_id) {
      // If a system user ID is provided, filter results by the projects/surveys that user has access to
      queryBuilder.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    return queryBuilder;
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
        'deployment.deployment_id as deployment_id',
        'deployment.critter_id as critter_id',
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
   * Add where clause to filter `Vectronic` telemetry data by device attachment date range.
   *
   * Note: Joins the `deployment` table.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getVectronicTelemetryByAttachmentDateRangeClause(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment', 'telemetry_vectronic.device_key', 'deployment.device_key')
      .andWhereRaw('telemetry_vectronic.acquisitiontime >= deployment.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_vectronic.acquisitiontime <= deployment.attachment_end_timestamp')
          .orWhereRaw('deployment.attachment_end_timestamp IS NULL')
      );
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
    return queryBuilder.andWhere('deployment.survey_id', surveyId);
  }

  /**
   * Add join to filter Vectronic telemetry data that has a valid credential key
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @returns {Knex.QueryBuilder}
   */
  getVectronicTelemetryByCredentialClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder
      .join(
        'survey_telemetry_vendor_credential',
        'telemetry_vectronic.device_key',
        'survey_telemetry_vendor_credential.device_key'
      )
      .andWhere('survey_telemetry_vendor_credential.survey_id', surveyId);
  }

  /**
   * Add where clause to filter `Vectronic` telemetry data by a list of deployment IDs.
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
    return queryBuilder.whereIn('deployment.deployment_id', deploymentIds);
  }

  /**
   * Add where clause to filter `Vectronic` telemetry data by a telemetry ID.
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
   * Find `Vectronic` telemetry data records the user has access to, based on filters and pagination options.
   *
   * Checks for vendor credentials.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findVectronicTelemetryClause(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    queryBuilder.join('survey', 'deployment.survey_id', 'survey.survey_id');

    if (!isUserAdmin) {
      // If the user is not an admin, filter results by vendor credentials
      queryBuilder.join(
        'survey_telemetry_vendor_credential',
        'survey.survey_id',
        'survey_telemetry_vendor_credential.survey_id'
      );
      // If the user is not an admin, filter results by the projects/surveys they have access to
      queryBuilder
        .join('project_participation', 'survey.project_id', 'project_participation.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    if (filterFields.keyword) {
      // Keyword Search filter
      const keywordMatch = `%${filterFields.keyword}%`;
      queryBuilder.where((subQueryBuilder) => {
        subQueryBuilder
          .where(knex.raw(`'${TelemetryVendorEnum.VECTRONIC}'`), 'ilike', keywordMatch)
          .orWhere(knex.raw('telemetry_vectronic.idcollar::text'), 'ilike', keywordMatch);
      });
    }

    if (filterFields.start_date) {
      queryBuilder.where('telemetry_vectronic.acquisitiontime', '>=', filterFields.start_date);
    }

    if (filterFields.end_date) {
      queryBuilder.where('telemetry_vectronic.acquisitiontime', '<=', filterFields.end_date);
    }

    if (filterFields.system_user_id) {
      // If a system user ID is provided, filter results by the projects/surveys that user has access to
      queryBuilder.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    return queryBuilder;
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
        'deployment.deployment_id as deployment_id',
        'deployment.critter_id as critter_id',
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
   * Add where clause to filter `ATS` telemetry data by device attachment date range.
   *
   * Note: Joins the `deployment` table.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getATSTelemetryByAttachmentDateRangeClause(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    return queryBuilder
      .join('deployment', 'telemetry_ats.device_key', 'deployment.device_key')
      .andWhereRaw('telemetry_ats.date >= deployment.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_ats.date <= deployment.attachment_end_timestamp')
          .orWhereRaw('deployment.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Add where clause to filter `ATS` telemetry data by device attachment date range.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getATSTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder.andWhere('deployment.survey_id', surveyId);
  }

  /**
   * Add where clause to filter `ATS` telemetry data by a telemetry ID.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getATSTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment.deployment_id', deploymentIds);
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
   * Find `ATS` telemetry data records the user has access to, based on filters and pagination options.
   *
   * TODO: Add check for credentials (same method or different method?)
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findATSTelemetryClause(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    queryBuilder.join('survey', 'deployment.survey_id', 'survey.survey_id');

    if (!isUserAdmin) {
      // If the user is not an admin, filter results by the projects/surveys they have access to
      queryBuilder
        .join('project_participation', 'survey.project_id', 'project_participation.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    if (filterFields.keyword) {
      // Keyword Search filter
      const keywordMatch = `%${filterFields.keyword}%`;
      queryBuilder.where((subQueryBuilder) => {
        subQueryBuilder
          .where(knex.raw(`'${TelemetryVendorEnum.ATS}'`), 'ilike', keywordMatch)
          .orWhere(knex.raw('telemetry_ats.collarserialnumber::text'), 'ilike', keywordMatch);
      });
    }

    if (filterFields.start_date) {
      queryBuilder.where('telemetry_ats.date', '>=', filterFields.start_date);
    }

    if (filterFields.end_date) {
      queryBuilder.where('telemetry_ats.date', '<=', filterFields.end_date);
    }

    if (filterFields.system_user_id) {
      // If a system user ID is provided, filter results by the projects/surveys that user has access to
      queryBuilder.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    return queryBuilder;
  }

  /**
   * Get normalized `Manual` telemetry base query.
   *
   * Note: Joins the `deployment`, `device` tables.
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
        'telemetry_manual.deployment_id as deployment_id',
        'deployment.critter_id as critter_id',
        knex.raw(`'${TelemetryVendorEnum.MANUAL}' as vendor`),
        'device.serial',
        'telemetry_manual.acquisition_date',
        'telemetry_manual.latitude',
        'telemetry_manual.longitude',
        knex.raw('NULL as elevation'),
        knex.raw('NULL as temperature')
      )
      .from('telemetry_manual')
      .join('deployment', 'telemetry_manual.deployment_id', 'deployment.deployment_id')
      .join('device', 'deployment.device_id', 'device.device_id');
  }

  /**
   * Add where clause to filter `Manual` telemetry data by device attachment date range.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number} surveyId
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getManualTelemetryBySurveyIdClause(queryBuilder: Knex.QueryBuilder, surveyId: number): Knex.QueryBuilder {
    return queryBuilder.andWhere('deployment.survey_id', surveyId);
  }

  /**
   * Add where clause to filter `Manual` telemetry data by device attachment date range.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {string} startDate
   * @param {string} endDate
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  getManualTelemetryByAttachmentDateRangeClause(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    return queryBuilder
      .andWhereRaw('telemetry_manual.acquisition_date >= deployment.attachment_start_timestamp')
      .andWhere((qb) =>
        qb
          .orWhereRaw('telemetry_manual.acquisition_date <= deployment.attachment_end_timestamp')
          .orWhereRaw('deployment.attachment_end_timestamp IS NULL')
      );
  }

  /**
   * Add where clause to filter `Manual` telemetry data by a list of deployment IDs.
   *
   * @see TelemetrySchema ./telemetry-vendor-repository.interface.ts
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {number[]} deploymentIds
   * @returns {Knex.QueryBuilder}
   */
  getManualTelemetryByDeploymentIdsClause(queryBuilder: Knex.QueryBuilder, deploymentIds: number[]): Knex.QueryBuilder {
    return queryBuilder.whereIn('deployment.deployment_id', deploymentIds);
  }

  /**
   * Add where clause to filter `Manual` telemetry data by a telemetry ID.
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
   * Find `Manual` telemetry data records the user has access to, based on filters and pagination options.
   *
   * TODO: Add check for credentials (same method or different method?)
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findManualTelemetryClause(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    queryBuilder.join('survey', 'deployment.survey_id', 'survey.survey_id');

    if (!isUserAdmin) {
      // If the user is not an admin, filter results by the projects/surveys they have access to
      queryBuilder
        .join('project_participation', 'survey.project_id', 'project_participation.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    if (filterFields.keyword) {
      // Keyword Search filter
      const keywordMatch = `%${filterFields.keyword}%`;
      queryBuilder.where((subQueryBuilder) => {
        subQueryBuilder.where(knex.raw(`'${TelemetryVendorEnum.MANUAL}'`), 'ilike', keywordMatch);
      });
    }

    if (filterFields.start_date) {
      queryBuilder.where('telemetry_manual.acquisition_date', '>=', filterFields.start_date);
    }

    if (filterFields.end_date) {
      queryBuilder.where('telemetry_manual.acquisition_date', '<=', filterFields.end_date);
    }

    if (filterFields.system_user_id) {
      // If the user is not an admin, filter results by the projects/surveys they have access to
      queryBuilder.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    return queryBuilder;
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
        .modify(this.getLotekTelemetryByAttachmentDateRangeClause)
        .modify(this.getLotekTelemetryByCredentialClause, surveyId)
        .modify(this.getLotekTelemetryBySurveyIdClause, surveyId)
        .modify(this.getLotekTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * VECTRONIC Telemetry
       */
      this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getVectronicTelemetryByAttachmentDateRangeClause)
        .modify(this.getVectronicTelemetryByCredentialClause, surveyId)
        .modify(this.getVectronicTelemetryBySurveyIdClause, surveyId)
        .modify(this.getVectronicTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * ATS Telemetry
       */
      this.getATSTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getATSTelemetryByAttachmentDateRangeClause)
        .modify(this.getATSTelemetryBySurveyIdClause, surveyId)
        .modify(this.getATSTelemetryByDeploymentIdsClause, deploymentIds),
      /**
       * MANUAL Telemetry
       */
      this.getManualTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getManualTelemetryByAttachmentDateRangeClause)
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
        if (options.pagination.sort === 'acquisition_time') {
          // Allow sorting by acquisition_time, which is not a real database column
          queryBuilder.orderByRaw(knex.raw(`acquisition_date::time ${options.pagination.order}`));
        } else {
          queryBuilder.orderBy(options.pagination.sort, options.pagination.order);
        }
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
            .modify(this.getLotekTelemetryByAttachmentDateRangeClause)
            .modify(this.getLotekTelemetryByCredentialClause, surveyId)
            .modify(this.getLotekTelemetryBySurveyIdClause, surveyId)
            .modify(this.getLotekTelemetryByTelemetryIdClause, telemetryId),
          /**
           * VECTRONIC Telemetry
           */
          this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getVectronicTelemetryByAttachmentDateRangeClause)
            .modify(this.getVectronicTelemetryByCredentialClause, surveyId)
            .modify(this.getVectronicTelemetryBySurveyIdClause, surveyId)
            .modify(this.getVectronicTelemetryByTelemetryIdClause, telemetryId),
          /**
           * ATS Telemetry
           */
          this.getATSTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getATSTelemetryByAttachmentDateRangeClause)
            .modify(this.getATSTelemetryBySurveyIdClause, surveyId)
            .modify(this.getATSTelemetryByTelemetryIdClause, telemetryId),
          /**
           * MANUAL Telemetry
           */
          this.getManualTelemetryBaseQuery(knex.queryBuilder())
            .modify(this.getManualTelemetryByAttachmentDateRangeClause)
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

  /**
   * Get normalized telemetry for all telemetry records the user has access to, based on filters and pagination options.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findTelemetryBaseQuery(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder.unionAll([
      /**
       * LOTEK Telemetry
       */
      this.getLotekTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getLotekTelemetryByAttachmentDateRangeClause)
        .modify(this.findLotekTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * VECTRONIC Telemetry
       */
      this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getVectronicTelemetryByAttachmentDateRangeClause)
        .modify(this.findVectronicTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * ATS Telemetry
       */
      this.getATSTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getATSTelemetryByAttachmentDateRangeClause)
        .modify(this.findATSTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * MANUAL Telemetry
       */
      this.getManualTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getManualTelemetryByAttachmentDateRangeClause)
        .modify(this.findManualTelemetryClause, isUserAdmin, systemUserId, filterFields)
    ]);
  }

  /**
   * Retrieves the paginated list of all surveys that are available to the user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<Telemetry[]>}
   * @memberof TelemetryVendorRepository
   */
  async findTelemetry(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<Telemetry[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (qb) => {
        this.findTelemetryBaseQuery(qb, isUserAdmin, systemUserId, filterFields);
      })
      .select('*')
      .from('telemetry');

    // Inject pagination / sorting if provided
    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        if (pagination.sort === 'acquisition_time') {
          // Allow sorting by acquisition_time, which is not a real database column
          queryBuilder.orderByRaw(knex.raw(`acquisition_date::time ${pagination.order}`));
        } else {
          queryBuilder.orderBy(pagination.sort, pagination.order);
        }
      }
    }

    const response = await this.connection.knex(queryBuilder, TelemetrySchema);

    return response.rows;
  }

  /**
   * Get telemetry count for all telemetry records the user has access to, based on filters and pagination options.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAllTelemetryAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof TelemetryVendorRepository
   */
  findTelemetryCountBaseQuery(
    queryBuilder: Knex.QueryBuilder,
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    return queryBuilder.unionAll([
      /**
       * LOTEK Telemetry
       */
      this.getLotekTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getLotekTelemetryByAttachmentDateRangeClause)
        .modify(this.findLotekTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * VECTRONIC Telemetry
       */
      this.getVectronicTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getVectronicTelemetryByAttachmentDateRangeClause)
        .modify(this.findVectronicTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * ATS Telemetry
       */
      this.getATSTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getATSTelemetryByAttachmentDateRangeClause)
        .modify(this.findATSTelemetryClause, isUserAdmin, systemUserId, filterFields),
      /**
       * MANUAL Telemetry
       */
      this.getManualTelemetryBaseQuery(knex.queryBuilder())
        .modify(this.getManualTelemetryByAttachmentDateRangeClause)
        .modify(this.findManualTelemetryClause, isUserAdmin, systemUserId, filterFields)
    ]);
  }

  /**
   * Returns the total number of surveys that the user has access to
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {ISurveyAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof SurveyService
   */
  async findTelemetryCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IAllTelemetryAdvancedFilters
  ): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .with('telemetry', (qb) => {
        this.findTelemetryCountBaseQuery(qb, isUserAdmin, systemUserId, filterFields);
      })
      .select(knex.raw('count(*)::integer as count'))
      .from('telemetry');

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get telemetry count', [
        'TelemetryVendorRepository->findTelemetryCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Insert vendor device key data
   *
   * @async
   * @param {number} survey_id
   * @param {string} deviceKey
   * @param {number} survey_telemetry_credential_attachment_id
   * @returns {Promise<number>}
   */
  async insertTelemetryCredentialAttachmentVendor(
    survey_id: number,
    deviceKey: string,
    survey_telemetry_credential_attachment_id: number
  ): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_telemetry_vendor_credential (
        survey_id,
        survey_telemetry_credential_attachment_id,
        device_key
      ) VALUES (
        ${survey_id},
        ${survey_telemetry_credential_attachment_id},
        ${deviceKey}
      )
      RETURNING
        survey_telemetry_vendor_credential_id;
      `;

    const responseVendor = await this.connection.sql(
      sqlStatement,
      z.object({ survey_telemetry_vendor_credential_id: z.number() })
    );

    if (!responseVendor?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to insert vendor device key attachment data', [
        'AttachmentRepository->insertTelemetryCredentialAttachmentVendor',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return responseVendor?.rows?.[0].survey_telemetry_vendor_credential_id;
  }
}
