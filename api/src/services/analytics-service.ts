import { IDBConnection } from '../database/db';
import {
  ObservationAnalyticsResponse,
  ObservationCountByGroup,
  ObservationCountByGroupSQLResponse,
  ObservationCountByGroupWithMeasurements,
  QualitativeMeasurementAnalytics,
  QuantitativeMeasurementAnalytics
} from '../models/observation-analytics';
import { AnalyticsRepository } from '../repositories/analytics-repository';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from './critterbase-service';
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
  ): Promise<ObservationAnalyticsResponse[]> {
    const critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    try {
      // Fetch observation counts from repository
      const counts = await this.analyticsRepository.getObservationCountByGroup(
        surveyIds,
        this._filterNonEmptyColumns(groupByColumns),
        this._filterNonEmptyColumns(groupByQuantitativeMeasurements),
        this._filterNonEmptyColumns(groupByQualitativeMeasurements)
      );

      // Fetch measurement definitions in parallel
      const [qualitativeDefinitions, quantitativeDefinitions] = await Promise.all([
        this._fetchQualitativeDefinitions(critterbaseService, counts),
        this._fetchQuantitativeDefinitions(critterbaseService, counts)
      ]);

      const transformedCounts = this._transformMeasurementObjectKeysToArrays(counts);

      return this._processCounts(transformedCounts, qualitativeDefinitions, quantitativeDefinitions);
    } catch (error) {
      console.error('Error fetching observation counts:', error);
      throw error;
    }
  }

  _filterNonEmptyColumns(columns: string[]): string[] {
    return columns.filter((column) => column.trim() !== '');
  }

  async _fetchQualitativeDefinitions(
    critterbaseService: CritterbaseService,
    counts: ObservationCountByGroupSQLResponse[]
  ): Promise<CBQualitativeMeasurementTypeDefinition[]> {
    const qualTaxonMeasurementIds = this._extractMeasurementIds(counts, 'qual_measurements');
    return critterbaseService.getQualitativeMeasurementTypeDefinition(qualTaxonMeasurementIds);
  }

  async _fetchQuantitativeDefinitions(
    critterbaseService: CritterbaseService,
    counts: ObservationCountByGroupSQLResponse[]
  ): Promise<CBQuantitativeMeasurementTypeDefinition[]> {
    const quantTaxonMeasurementIds = this._extractMeasurementIds(counts, 'quant_measurements');
    return critterbaseService.getQuantitativeMeasurementTypeDefinition(quantTaxonMeasurementIds);
  }

  _extractMeasurementIds(
    counts: ObservationCountByGroupSQLResponse[],
    measurementType: 'quant_measurements' | 'qual_measurements'
  ): string[] {
    return Object.keys(counts[0]?.[measurementType] ?? {}).map((id) => id);
  }

  _processCounts(
    counts: (ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[],
    qualitativeDefinitions: CBQualitativeMeasurementTypeDefinition[],
    quantitativeDefinitions: CBQuantitativeMeasurementTypeDefinition[]
  ): ObservationAnalyticsResponse[] {
    const newCounts: ObservationAnalyticsResponse[] = [];
    for (const count of counts) {
      const { qual_measurements, quant_measurements, ...rest } = count;

      newCounts.push({
        ...rest,
        qualitative_measurements: this._mapQualitativeMeasurements(qual_measurements, qualitativeDefinitions),
        quantitative_measurements: this._mapQuantitativeMeasurements(quant_measurements, quantitativeDefinitions)
      });
    }
    return newCounts;
  }

  _mapQualitativeMeasurements(
    qualMeasurements: { option_id: string | null; critterbase_taxon_measurement_id: string }[],
    definitions: CBQualitativeMeasurementTypeDefinition[]
  ): QualitativeMeasurementAnalytics[] {
    return qualMeasurements
      .map((measurement) => {
        const definition = definitions.find(
          (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
        );

        if (definition && measurement.option_id) {
          return {
            option: {
              option_id: measurement.option_id,
              option_label:
                definition.options.find((option) => option.qualitative_option_id === measurement.option_id)
                  ?.option_label ?? ''
            },
            taxon_measurement_id: measurement.critterbase_taxon_measurement_id,
            measurement_name: definition.measurement_name ?? ''
          };
        }

        return null;
      })
      .filter((item): item is QualitativeMeasurementAnalytics => item !== null);
  }

  _mapQuantitativeMeasurements(
    quantMeasurements: { value: number | null; critterbase_taxon_measurement_id: string }[],
    definitions: CBQuantitativeMeasurementTypeDefinition[]
  ): QuantitativeMeasurementAnalytics[] {
    return quantMeasurements
      .map((measurement) => {
        const definition = definitions.find(
          (def) => def.taxon_measurement_id === measurement.critterbase_taxon_measurement_id
        );

        if (definition && measurement.value !== null) {
          return {
            value: measurement.value,
            taxon_measurement_id: measurement.critterbase_taxon_measurement_id,
            measurement_name: definition.measurement_name ?? ''
          };
        }

        return null;
      })
      .filter((item): item is QuantitativeMeasurementAnalytics => item !== null);
  }

  _transformMeasurementObjectKeysToArrays(
    counts: ObservationCountByGroupSQLResponse[]
  ): (ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[] {
    return counts.map((count) => {
      const { quant_measurements, qual_measurements, ...rest } = count;

      // Transform quantitative measurements
      const quantitative = Object.entries(quant_measurements).map(([measurementId, value]) => ({
        critterbase_taxon_measurement_id: measurementId,
        value: value
      }));

      // Transform qualitative measurements
      const qualitative = Object.entries(qual_measurements).map(([measurementId, optionId]) => ({
        critterbase_taxon_measurement_id: measurementId,
        option_id: optionId
      }));

      return {
        ...rest,
        qual_measurements: qualitative,
        quant_measurements: quantitative
      };
    });
  }
}
