import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IAlert, IAlertCreateObject, IAlertFilterObject } from '../models/alert-view';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing alert data.
 *
 * @export
 * @class AlertRepository
 * @extends {BaseRepository}
 */
export class AlertRepository extends BaseRepository {
  _getAlertBaseQuery() {
    const knex = getKnex();

    return knex
      .select(
        'alert_id',
        'name',
        'message',
        'type',
        'data',
        'record_end_date',
        knex.raw(`
    CASE
      WHEN record_end_date < NOW() THEN 'expired'
      ELSE 'active'
    END AS status
  `)
      )
      .from('alert');
  }
  /**
   * Get all alert records, including deactivated alerts
   *
   * @param {IAlertFilterObject} filterObject
   * @return {*}  {Promise<IAlert>}
   * @memberof AlertRepository
   */
  async getAlerts(filterObject: IAlertFilterObject): Promise<IAlert[]> {
    const queryBuilder = this._getAlertBaseQuery();

    if (filterObject.recordEndDate) {
      queryBuilder.where((qb) => {
        qb.whereRaw(`record_end_date >= ?`, [filterObject.recordEndDate]).orWhereNull('record_end_date');
      });
    }

    if (filterObject.types && filterObject.types.length > 0) {
      queryBuilder.whereIn('type', filterObject.types);
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
   * Update survey alert.
   *
   * @param {IAlert} alert
   * @return {*}  number
   * @memberof AlertRepository
   */
  async updateAlert(alert: IAlert): Promise<number> {
    const sqlStatement = SQL`
      UPDATE alert
      SET
        name = ${alert.name},
        message = ${alert.message},
        type = ${alert.type},
        data = ${JSON.stringify(alert.data)}::json
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
   * Create survey alert.
   *
   * @param {IAlertCreateObject} alert
   * @return {*}  number
   * @memberof AlertRepository
   */
  async createAlert(alert: IAlertCreateObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO
        alert (name, message, type, data, record_end_date)
      VALUES
        (${alert.name}, ${alert.message}, ${alert.type}, ${JSON.stringify(alert.data)}, ${alert.record_end_date})
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
   * Deactivate (soft delete) survey alert. It is possible to enter a future date to schedule deactivation.
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
   * Delete survey alert.
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
