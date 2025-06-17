import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import {
  AlertRecordWithStatus,
  IAlertCreateObject,
  IAlertFilterObject,
  IAlertUpdateObject
} from '../models/alert-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing alert data.
 *
 * @export
 * @class AlertRepository
 * @extends {BaseRepository}
 */
export class AlertRepository extends BaseRepository {
  /**
   * Builds query for all alert records without filtering any records, and adds a status field based on record_end_date
   *
   * @return {*}  {Knex.QueryBuilder}
   * @memberof AlertRepository
   */
  _getAlertBaseQuery(): Knex.QueryBuilder {
    const knex = getKnex();

    return knex
      .select(
        'alert.alert_id',
        'alert.name',
        'alert.message',
        'alert.alert_type_id',
        'alert.data',
        'alert.severity',
        'alert.record_end_date',
        'alert.create_date',
        knex.raw(`
          CASE
            WHEN alert.record_end_date < NOW() THEN 'expired'
            ELSE 'active'
          END AS status
        `)
      )
      .from('alert');
  }

  /**
   * Get alert records with optional filters applied
   *
   * @param {IAlertFilterObject} filterObject
   * @param {ApiPaginationOptions} pagination
   * @return {*}  {Promise<AlertRecordWithStatus[]>}
   * @memberof AlertRepository
   */
  async getAlerts(
    filterObject: IAlertFilterObject,
    pagination?: ApiPaginationOptions
  ): Promise<AlertRecordWithStatus[]> {
    const queryBuilder = this._getAlertBaseQuery();

    if (filterObject.expiresAfter) {
      queryBuilder.where((qb) => {
        qb.whereRaw(`alert.record_end_date >= ?`, [filterObject.expiresAfter]).orWhereNull('alert.record_end_date');
      });
    }

    if (filterObject.expiresBefore) {
      queryBuilder.where((qb) => {
        qb.whereRaw(`alert.record_end_date < ?`, [filterObject.expiresBefore]);
      });
    }

    if (filterObject.types && filterObject.types.length > 0) {
      queryBuilder
        .join('alert_type as at', 'at.alert_type_id', 'alert.alert_type_id')
        .whereRaw('lower(at.name) = ANY(?)', [filterObject.types.map((type) => type.toLowerCase())]);
    }

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      } else {
        queryBuilder.orderBy('alert_id', 'desc');
      }
    }

    const response = await this.connection.knex(queryBuilder, AlertRecordWithStatus);

    return response.rows;
  }

  /**
   * Gets count of alert records with optional filters applied
   *
   * @param {IAlertFilterObject} filterObject
   * @return {*}  {Promise<number>}
   * @memberof AlertRepository
   */
  async getAlertsCount(filterObject: IAlertFilterObject): Promise<number> {
    const queryBuilder = this._getAlertBaseQuery();

    if (filterObject.expiresAfter) {
      queryBuilder.where((qb) => {
        qb.whereRaw(`alert.record_end_date >= ?`, [filterObject.expiresAfter]).orWhereNull('alert.record_end_date');
      });
    }

    if (filterObject.expiresBefore) {
      queryBuilder.where((qb) => {
        qb.whereRaw(`alert.record_end_date < ?`, [filterObject.expiresBefore]);
      });
    }

    if (filterObject.types && filterObject.types.length > 0) {
      queryBuilder
        .join('alert_type as at', 'at.alert_type_id', 'alert.alert_type_id')
        .whereRaw('lower(at.name) = ANY(?)', [filterObject.types.map((type) => type.toLowerCase())]);
    }

    const knex = getKnex();

    const query = knex.from(queryBuilder.as('qb')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Get a specific alert by its Id
   *
   * @param {number} alertId
   * @return {*}  {Promise< AlertRecordWithStatus>}
   * @memberof AlertRepository
   */
  async getAlertById(alertId: number): Promise<AlertRecordWithStatus> {
    const queryBuilder = this._getAlertBaseQuery();

    queryBuilder.where('alert_id', alertId);

    const response = await this.connection.knex(queryBuilder, AlertRecordWithStatus);

    return response.rows[0];
  }

  /**
   * Update system alert.
   *
   * @param {IAlertUpdateObject} alert
   * @return {*} Promise<number>
   * @memberof AlertRepository
   */
  async updateAlert(alert: IAlertUpdateObject): Promise<number> {
    const sqlStatement = SQL`
      UPDATE alert
      SET
        name = ${alert.name},
        message = ${alert.message},
        alert_type_id = ${alert.alert_type_id},
        severity = ${alert.severity},
        data = ${JSON.stringify(alert.data)}::json,
        record_end_date = ${alert.record_end_date}
      WHERE
        alert_id = ${alert.alert_id}
      RETURNING alert_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update alert', [
        'AlertRepository->updateAlert',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].alert_id;
  }

  /**
   * Create system alert.
   *
   * @param {IAlertCreateObject} alert
   * @return {*}  Promise<number>
   * @memberof AlertRepository
   */
  async createAlert(alert: IAlertCreateObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO
        alert (name, message, alert_type_id, data, severity, record_end_date)
      VALUES
        (${alert.name}, ${alert.message}, ${alert.alert_type_id}, ${JSON.stringify(alert.data)}, ${alert.severity}, ${
          alert.record_end_date
        })
      RETURNING alert_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create alert', [
        'AlertRepository->createAlert',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].alert_id;
  }

  /**
   * Delete system alert.
   *
   * @param {number} alertId
   * @return {*}  Promise<number>
   * @memberof AlertRepository
   */
  async deleteAlert(alertId: number): Promise<number> {
    const sqlStatement = SQL`
      DELETE FROM
        alert
      WHERE
        alert_id = ${alertId}
      RETURNING alert_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete alert', [
        'AlertRepository->deleteAlert',
        'rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].alert_id;
  }
}
