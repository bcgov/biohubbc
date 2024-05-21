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
    console.log(groupByQuantitativeMeasurements);
    const analytics = await this.analyticsRepository.getObservationCountByGroup(
      surveyIds,
      groupByColumns,
      groupByQuantitativeMeasurements,
      groupByQualitativeMeasurements
    );

    console.log(analytics);

    // transform measurements into columns
    const transformedData = analytics.map((item) => {
      const result = {
        count: item.count,
        percentage: item.percentage
      };

      // include properties from groupBy array
      groupByColumns.forEach((prop) => {
        result[prop] = item[prop];
      });

      // transform quantitative measurements into properties
      item.quantitative_measurements?.forEach((qm) => {
        // if (groupByQuantitativeMeasurements.includes(qm.critterbase_taxon_measurement_id)) {
        result[qm.critterbase_taxon_measurement_id] = qm.value;
        // }
      });

      // transform qualitative measurements into properties
      item.qualitative_measurements?.forEach((qm) => {
        // if (groupByQualitativeMeasurements.includes(qm.critterbase_taxon_measurement_id)) {
        result[qm.critterbase_taxon_measurement_id] = qm.option_id;
        // }
      });

      return result;
    });

    console.log(transformedData);

    return transformedData;
  }
}
