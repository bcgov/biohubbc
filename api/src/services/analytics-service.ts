import { IDBConnection } from '../database/db';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import { CritterbaseService } from './critterbase-service';
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
    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    const counts = await this.analyticsRepository.getObservationCountByGroup(
      surveyIds,
      groupByColumns,
      groupByQuantitativeMeasurements,
      groupByQualitativeMeasurements
    );

    // all objects are identical so get keys using the first object of the arrya
    const quant_taxon_measurement_ids = Object.keys(counts[0].qualitative_measurements);
    const qual_taxon_measurement_ids = Object.keys(counts[0].quantitative_measurements);

    const qualitativeMeasurementPromise =
      critterbaseService.getQualitativeMeasurementTypeDefinition(quant_taxon_measurement_ids);
    const quantitativeMeasurementsPromise =
      critterbaseService.getQuantitativeMeasurementTypeDefinition(qual_taxon_measurement_ids);

    const [qualitativeMeasurementDefinitions, quantitativeMeasurementDefinitions] = await Promise.all([
      qualitativeMeasurementPromise,
      quantitativeMeasurementsPromise
    ]);

    // Update qualitative measurements for each row
    counts.forEach((row) => {
      row['qualitative'] = []; // Initialize the 'qualitative' array
      Object.keys(row.qualitative_measurements).forEach((measurementId) => {
        const measurement = row.qualitative_measurements[measurementId];
        if (measurement) {
          const qualitativeMeasurement = qualitativeMeasurementDefinitions.find(
            (def) => def.taxon_measurement_id === measurementId
          );
          if (qualitativeMeasurement) {
            row['qualitative'].push({
              // Push the new item to the 'qualitative' array
              option: {
                option_id: measurement,
                option_label: qualitativeMeasurement.options.find((option) => option.qualitative_option_id === measurement)
                  ?.option_label
              },
              taxon_measurement_id: measurementId,
              measurement_name: qualitativeMeasurement.measurement_name
            });
          }
        }
      });
    });

    // Update quantitative measurements for each row
    counts.forEach((row) => {
      row['quantitative'] = []; // Initialize the 'quantitative' array
      Object.keys(row.quantitative_measurements).forEach((measurementId) => {
        const measurement = row.quantitative_measurements[measurementId];
        if (measurement) {
          const quantitativeMeasurement = quantitativeMeasurementDefinitions.find(
            (def) => def.taxon_measurement_id === measurementId
          );
          if (quantitativeMeasurement) {
            row['quantitative'].push({
              // Push the new item to the 'quantitative' array
              value: measurement.value,
              taxon_measurement_id: measurementId,
              measurement_name: quantitativeMeasurement.measurement_name
            });
          }
        }
      });
    });

    return counts;
  }
}
