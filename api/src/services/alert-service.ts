import { IDBConnection } from '../database/db';
import { AlertRepository, IAlert, IAlertCreateObject } from '../repositories/alert-repository';
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
   * @param {string[]} alertTypes
   * @return {*}  {IAlertModel[]}
   * @memberof AlertService
   */
  async getAllAlerts(alertTypes: string[]): Promise<IAlert[]> {
    return this.alertRepository.getAllAlerts(alertTypes);
  }

  
  /**
   * Get a specific alert by its ID
   *
   * @param {number} alertId
   * @return {*}  {IAlertModel}
   * @memberof AlertService
   */
  async getAlertById(alertId: number): Promise<IAlert> {
    return this.alertRepository.getAlertById(alertId);
  }

  /**
   * Get active alert records, excluding deactivated alerts
   *
   * @param {string[]} alertTypes
   * @return {*}  {IAlertModel[]}
   * @memberof AlertService
   */
  async getActiveAlerts(alertTypes: string[]): Promise<IAlert[]> {
    return this.alertRepository.getActiveAlerts(alertTypes);
  }

  /**
   * Create and associate alert for survey.
   *
   * @param {IAlertCreateObjectt} alert
   * @return {*}  {IAlertModel[]}
   * @memberof AlertService
   */
  async createAlert(alert: IAlertCreateObject): Promise<number | null> {
    return this.alertRepository.createAlert(alert);
  }

  /**
   * Update a survey alert.
   *
   * @param {IAlert} alert
   * @return {*}  {IAlertModel[]}
   * @memberof AlertService
   */
  async updateAlert(alert: IAlert): Promise<number> {
    return this.alertRepository.updateAlert(alert);
  }

  /**
   * Deactive an alert (soft delete by entering a record_end_date)
   *
   * @param {number} alertId
   * @param {number} recordEndDate
   * @return {*}  QueryResult<any>
   * @memberof AlertService
   */
  async deactivateAlert(alertId: number, recordEndDate: string): Promise<number> {
    return this.alertRepository.deactivateAlert(alertId, recordEndDate);
  }

  /**
   * Delete a survey alert.
   *
   * @param {number} alertId
   * @return {*}  QueryResult<any>
   * @memberof AlertService
   */
  async deleteAlert(alertId: number): Promise<number> {
    return this.alertRepository.deleteAlert(alertId);
  }
}
