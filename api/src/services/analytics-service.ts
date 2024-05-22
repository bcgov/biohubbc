import { IDBConnection } from '../database/db';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import { DBService } from './db-service';

export interface IObservationCountByGroup {
  count: number;
  percentage: number;
}

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
   * @param {string[]} groupByColumns
   * @param {string[]} groupByQuantitativeMeasurements
   * @param {string[]} groupByQualitativeMeasurements
   * @returns {*} {Promise<{id: number}[]>}
   * @memberof AnalyticsService
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<IObservationCountByGroup[]> {
    return this.analyticsRepository.getObservationCountByGroup(
      surveyIds,
      groupByColumns,
      groupByQuantitativeMeasurements,
      groupByQualitativeMeasurements
    );
  }
}
