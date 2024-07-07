import { IDBConnection } from '../database/db';
import {
  ObservationCountByGroupWithNamedMeasurements,
  QualitativeMeasurementAnalytics,
  QuantitativeMeasurementAnalytics
} from '../models/observation-analytics';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import { CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';

export class AnalyticsService extends DBService {
  private analyticsRepository: AnalyticsRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.analyticsRepository = new AnalyticsRepository(connection);
  }

  /**
   * Gets observation counts by group for given survey IDs and groupings.
   *
   * @param surveyIds Array of survey IDs
   * @param groupByColumns Columns to group by
   * @param groupByQuantitativeMeasurements Quantitative measurements to group by
   * @param groupByQualitativeMeasurements Qualitative measurements to group by
   * @returns Array of ObservationCountByGroupWithNamedMeasurements
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<ObservationCountByGroupWithNamedMeasurements[]> {
    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    try {
      // Fetch observation counts from repository
      const counts = await this.analyticsRepository.getObservationCountByGroup(
        surveyIds,
        groupByColumns.filter((column) => column.trim() !== ""),
        groupByQuantitativeMeasurements.filter((column) => column.trim() !== ""),
        groupByQualitativeMeasurements.filter((column) => column.trim() !== "")
      );

      // Extract unique measurement IDs
      const quant_taxon_measurement_ids = Object.keys(counts[0]?.quant_measurements ?? {});
      const qual_taxon_measurement_ids = Object.keys(counts[0]?.qual_measurements ?? {});

      // Fetch measurement definitions in parallel
      const [qualitativeMeasurementDefinitions, quantitativeMeasurementDefinitions] = await Promise.all([
        critterbaseService.getQualitativeMeasurementTypeDefinition(qual_taxon_measurement_ids),
        critterbaseService.getQuantitativeMeasurementTypeDefinition(quant_taxon_measurement_ids)
      ]);

      // Process each count row to map measurement IDs to names and labels
      const results: ObservationCountByGroupWithNamedMeasurements[] = [];

      for (const row of counts) {
        const { quant_measurements, qual_measurements, ...newRow } = row;

        const namedQualitativeMeasurements: QualitativeMeasurementAnalytics[] = [];
        for (const measurementId of Object.keys(qual_measurements)) {
          const option_id = qual_measurements[measurementId];

          const qualitativeMeasurement = qualitativeMeasurementDefinitions.find(
            (def) => def.taxon_measurement_id === measurementId
          );

          if (qualitativeMeasurement) {
            namedQualitativeMeasurements.push({
              option: {
                option_id: option_id,
                option_label:
                  qualitativeMeasurement?.options.find((option) => option.qualitative_option_id === option_id)
                    ?.option_label ?? ''
              },
              taxon_measurement_id: measurementId,
              measurement_name: qualitativeMeasurement?.measurement_name ?? ''
            });
          }
        }

        const namedQuantitativeMeasurements: QuantitativeMeasurementAnalytics[] = [];
        for (const measurementId of Object.keys(quant_measurements)) {
          const value = quant_measurements[measurementId];

          const quantitativeMeasurement = quantitativeMeasurementDefinitions.find(
            (def) => def.taxon_measurement_id === measurementId
          );

          if (quantitativeMeasurement) {
            namedQuantitativeMeasurements.push({
              value: value,
              taxon_measurement_id: measurementId,
              measurement_name: quantitativeMeasurement?.measurement_name ?? ''
            });
          }
        }

        results.push({
          ...newRow,
          qualitative_measurements: namedQualitativeMeasurements,
          quantitative_measurements: namedQuantitativeMeasurements
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching observation counts:', error);
      throw error;
    }
  }
}
