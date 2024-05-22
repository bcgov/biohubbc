import { IDBConnection } from '../database/db';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';

interface IQualitativeMeasurementGroup {
  option: {
    option_id: string;
    option_label: string;
  };
  taxon_measurement_id: string;
  measurement_name: string;
}

interface IQuantitativeMeasurementGroup {
  value: number;
  taxon_measurement_id: string;
  measurement_name: string;
}

export interface IObservationCountByGroup {
  count: number;
  percentage: number;
  qualitative_measurement: IQualitativeMeasurementGroup[];
  quantitative_measurement: IQuantitativeMeasurementGroup[];
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
    const quant_taxon_measurement_ids = Object.keys(counts[0].qual_measurements);
    const qual_taxon_measurement_ids = Object.keys(counts[0].quant_measurements);

    const qualitativeMeasurementPromise =
      critterbaseService.getQualitativeMeasurementTypeDefinition(quant_taxon_measurement_ids);
    const quantitativeMeasurementsPromise =
      critterbaseService.getQuantitativeMeasurementTypeDefinition(qual_taxon_measurement_ids);

    const [qualitativeMeasurementDefinitions, quantitativeMeasurementDefinitions] = await Promise.all([
      qualitativeMeasurementPromise,
      quantitativeMeasurementsPromise
    ]);

    // Update qualitative measurements for each row
    const newCounts = counts.map((row) => {
      row['qualitative_measurements'] = []; // Initialize the 'qualitative' array
      Object.keys(row.qual_measurements).map((measurementId) => {
        const option_id = row.qual_measurements[measurementId];

        const qualitativeMeasurement = qualitativeMeasurementDefinitions.find(
          (def) => def.taxon_measurement_id === measurementId
        );
        if (qualitativeMeasurement) {
          row['qualitative_measurements'].push({
            // Push the new item to the 'qualitative' array
            option: {
              option_id: option_id,
              option_label:
                qualitativeMeasurement?.options.find((option) => option.qualitative_option_id === option_id)
                  ?.option_label ?? ''
            },
            taxon_measurement_id: measurementId,
            measurement_name: qualitativeMeasurement?.measurement_name
          });
        }
      });

      row['quantitative_measurements'] = []; // Initialize the 'quantitative' array
      Object.keys(row.quant_measurements).map((measurementId) => {
        const value = row.quant_measurements[measurementId];

        const quantitativeMeasurement = quantitativeMeasurementDefinitions.find(
          (def) => def.taxon_measurement_id === measurementId
        );
        if (quantitativeMeasurement) {
          row['quantitative_measurements'].push({
            // Push the new item to the 'quantitative' array
            value: value,
            taxon_measurement_id: measurementId,
            measurement_name: quantitativeMeasurement?.measurement_name
          });
        }
      });

      const { quant_measurements, qual_measurements, ...newRow } = row;

      return newRow;
    });

    return newCounts;
  }
}
