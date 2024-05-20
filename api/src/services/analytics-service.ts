import { IDBConnection } from '../database/db';
import { AnalyticsRepository, IObservationCountByGroup } from '../repositories/analytics-repository';
import { DBService } from './db-service';

export class AnalyticsService extends DBService {
  analyticsRepository: AnalyticsRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.analyticsRepository = new AnalyticsRepository(connection);
  }

  /**
   * Get Survey IDs for a project ID
   *
   * @param {number[]} surveyIds
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof AnalyticsService
   */
  async getObservationCountByGroup(surveyIds: number[], groupBy: string[]): Promise<IObservationCountByGroup[]> {
    return this.analyticsRepository.getObservationCountByGroup(surveyIds, groupBy);
  }
}
