import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IAlert, IAlertCreateObject, IAlertFilterObject, IAlertUpdateObject } from '../models/alert-view';
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
   * Get alert records with filters
   *
   * @param {IAlertFilterObject} filterObject
   * @return {*}  {Promise<IAlert[]>}
   * @memberof AlertRepository
   */
  async getAlerts(filterObject: IAlertFilterObject): Promise<IAlert[]> {
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

    const response = await this.connection.knex(queryBuilder, IAlert);

    return response.rows;
  }

  /**
   * Get a specific alert by its Id
   *
   * @param {number} alertId
   * @return {*}  {Promise<IAlert>}
   * @memberof AlertRepository
   */
  async getAlertById(alertId: number): Promise<IAlert> {
    const queryBuilder = this._getAlertBaseQuery();

    queryBuilder.where('alert_id', alertId);

    const response = await this.connection.knex(queryBuilder, IAlert);

    return response.rows[0];
  }

  /**
   * Update system alert.
   *
   * @param {IAlert} alert
   * @return {*}  number
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

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get update Alert', [
        'AlertRepository->updateAlert',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.alert_id;
  }

  /**
   * Create system alert.
   *
   * @param {IAlertCreateObject} alert
   * @return {*}  number
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

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get Create Alert', [
        'AlertRepository->createAlert',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.alert_id;
  }

  /**
   * Deactivate (soft delete) system alert. It is possible to enter a future date to schedule deactivation.
   *
   * @param {number} alertId
   * @param {number} recordEndDate
   * @return {*}  number
   * @memberof AlertRepository
   */
  async deactivateAlert(alertId: number, recordEndDate: string): Promise<number> {
    const sqlStatement = SQL`
      UPDATE alert
      SET
        record_end_date = ${recordEndDate}
      WHERE
        alert_id = ${alertId}
      RETURNING alert_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get Delete Alert', [
        'AlertRepository->deleteAlert',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.alert_id;
  }

  /**
   * Delete system alert.
   *
   * @param {number} alertId
   * @return {*}  number
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

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get Delete Alert', [
        'AlertRepository->deleteAlert',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.alert_id;
  }
}
