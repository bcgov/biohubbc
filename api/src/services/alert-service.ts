import { IDBConnection } from '../database/db';
import {
  AlertRecordWithStatus,
  IAlertCreateObject,
  IAlertFilterObject,
  IAlertUpdateObject
} from '../models/alert-view';
import { AlertRepository } from '../repositories/alert-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';

export class AlertService extends DBService {
  alertRepository: AlertRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.alertRepository = new AlertRepository(connection);
  }

  /**
   * Get all alert records, including deactivated alerts
   *
   * @param {IAlertFilterObject} filterObject
   * @param {ApiPaginationOptions} pagination
   * @return {*}  Promise<AlertRecordWithStatus[]>
   * @memberof AlertService
   */
  async getAlerts(
    filterObject: IAlertFilterObject,
    pagination?: ApiPaginationOptions
  ): Promise<AlertRecordWithStatus[]> {
    return this.alertRepository.getAlerts(filterObject, pagination);
  }

  /**
   * Get count of alert records, including deactivated alerts
   *
   * @param {IAlertFilterObject} filterObject
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async getAlertsCount(filterObject: IAlertFilterObject): Promise<number> {
    return this.alertRepository.getAlertsCount(filterObject);
  }

  /**
   * Get a specific alert by its ID
   *
   * @param {number} alertId
   * @return {*}  Promise<AlertRecordWithStatus>
   * @memberof AlertService
   */
  async getAlertById(alertId: number): Promise<AlertRecordWithStatus> {
    return this.alertRepository.getAlertById(alertId);
  }

  /**
   * Create a system alert.
   *
   * @param {IAlertCreateObjectt} alert
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async createAlert(alert: IAlertCreateObject): Promise<number> {
    return this.alertRepository.createAlert(alert);
  }

  /**
   * Update a system alert.
   *
   * @param {IAlertUpdateObject} alert
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async updateAlert(alert: IAlertUpdateObject): Promise<number> {
    return this.alertRepository.updateAlert(alert);
  }

  /**
   * Delete a system alert.
   *
   * @param {number} alertId
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async deleteAlert(alertId: number): Promise<number> {
    return this.alertRepository.deleteAlert(alertId);
  }
}
