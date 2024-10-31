import { IDBConnection } from '../database/db';
import { IAlert, IAlertCreateObject, IAlertFilterObject, IAlertUpdateObject } from '../models/alert-view';
import { AlertRepository } from '../repositories/alert-repository';
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
   * @return {*}  Promise<IAlert[]>
   * @memberof AlertService
   */
  async getAlerts(filterObject: IAlertFilterObject): Promise<IAlert[]> {
    return this.alertRepository.getAlerts(filterObject);
  }

  /**
   * Get a specific alert by its ID
   *
   * @param {number} alertId
   * @return {*}  Promise<IAlert>
   * @memberof AlertService
   */
  async getAlertById(alertId: number): Promise<IAlert> {
    return this.alertRepository.getAlertById(alertId);
  }

  /**
   * Create and associate alert for survey.
   *
   * @param {IAlertCreateObjectt} alert
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async createAlert(alert: IAlertCreateObject): Promise<number> {
    return this.alertRepository.createAlert(alert);
  }

  /**
   * Update a survey alert.
   *
   * @param {IAlertUpdateObject} alert
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async updateAlert(alert: IAlertUpdateObject): Promise<number> {
    return this.alertRepository.updateAlert(alert);
  }

  /**
   * Deactive an alert (soft delete by entering a record_end_date)
   *
   * @param {number} alertId
   * @param {number} recordEndDate
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async deactivateAlert(alertId: number, recordEndDate: string): Promise<number> {
    return this.alertRepository.deactivateAlert(alertId, recordEndDate);
  }

  /**
   * Delete a survey alert.
   *
   * @param {number} alertId
   * @return {*}  Promise<number>
   * @memberof AlertService
   */
  async deleteAlert(alertId: number): Promise<number> {
    return this.alertRepository.deleteAlert(alertId);
  }
}
