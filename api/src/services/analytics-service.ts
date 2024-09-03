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

/**
 * Handles all business logic related to data analytics.
 *
 * @export
 * @class AnalyticsService
 * @extends {DBService}
 */
export class AnalyticsService extends DBService {
  analyticsRepository: AnalyticsRepository;

  critterbaseService: CritterbaseService;

  constructor(connection: IDBConnection) {
    super(connection);
    this.analyticsRepository = new AnalyticsRepository(connection);

    this.critterbaseService = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
  }

  /**
   * Gets observation counts by group for given survey IDs and groupings.
   *
   * @param {number[]} surveyIds Array of survey IDs
   * @param {string[]} groupByColumns Columns to group by
   * @param {string[]} groupByQuantitativeMeasurements Quantitative measurements to group by
   * @param {string[]} groupByQualitativeMeasurements Qualitative measurements to group by
   * @return {Promise<ObservationAnalyticsResponse[]>} Array of ObservationCountByGroupWithNamedMeasurements
   * @memberof AnalyticsService
   */
  async getObservationCountByGroup(
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<ObservationAnalyticsResponse[]> {
    // Fetch observation counts from repository
    const counts = await this.analyticsRepository.getObservationCountByGroup(
      surveyIds,
      this._filterNonEmptyColumns(groupByColumns),
      this._filterNonEmptyColumns(groupByQuantitativeMeasurements),
      this._filterNonEmptyColumns(groupByQualitativeMeasurements)
    );

    // Fetch measurement definitions in parallel
    const [qualitativeDefinitions, quantitativeDefinitions] = await Promise.all([
      this._fetchQualitativeDefinitions(counts),
      this._fetchQuantitativeDefinitions(counts)
    ]);

    const transformedCounts = this._transformMeasurementObjectKeysToArrays(counts);

    return this._processCounts(transformedCounts, qualitativeDefinitions, quantitativeDefinitions);
  }

  /**
   * Filters out empty columns.
   *
   * @param {string[]} columns
   * @return {*}  {string[]}
   * @memberof AnalyticsService
   */
  _filterNonEmptyColumns(columns: string[]): string[] {
    return columns.filter((column) => column.trim() !== '');
  }

  /**
   * Fetches qualitative measurement definitions for given counts.
   *
   * @param {ObservationCountByGroupSQLResponse[]} counts
   * @return {*}  {Promise<CBQualitativeMeasurementTypeDefinition[]>}
   * @memberof AnalyticsService
   */
  async _fetchQualitativeDefinitions(
    counts: ObservationCountByGroupSQLResponse[]
  ): Promise<CBQualitativeMeasurementTypeDefinition[]> {
    const qualTaxonMeasurementIds = this._getQualitativeMeasurementIds(counts);

    if (qualTaxonMeasurementIds.length === 0) {
      return [];
    }

    return this.critterbaseService.getQualitativeMeasurementTypeDefinition(qualTaxonMeasurementIds);
  }

  /**
   * Fetches quantitative measurement definitions for given counts.
   *
   * @param {ObservationCountByGroupSQLResponse[]} counts
   * @return {*}  {Promise<CBQuantitativeMeasurementTypeDefinition[]>}
   * @memberof AnalyticsService
   */
  async _fetchQuantitativeDefinitions(
    counts: ObservationCountByGroupSQLResponse[]
  ): Promise<CBQuantitativeMeasurementTypeDefinition[]> {
    const quantTaxonMeasurementIds = this._getQuantitativeMeasurementIds(counts);

    if (quantTaxonMeasurementIds.length === 0) {
      return [];
    }

    return this.critterbaseService.getQuantitativeMeasurementTypeDefinition(quantTaxonMeasurementIds);
  }

  /**
   * Returns array of unique qualitative measurement IDs from given counts.
   *
   * @param {ObservationCountByGroupSQLResponse[]} counts
   * @return {*}  {string[]}
   * @memberof AnalyticsService
   */
  _getQualitativeMeasurementIds(counts: ObservationCountByGroupSQLResponse[]): string[] {
    return Array.from(new Set(counts.flatMap((count) => Object.keys(count.qual_measurements))));
  }

  /**
   * Returns array of unique quantitative measurement IDs from given counts.
   *
   * @param {ObservationCountByGroupSQLResponse[]} counts
   * @return {*}  {string[]}
   * @memberof AnalyticsService
   */
  _getQuantitativeMeasurementIds(counts: ObservationCountByGroupSQLResponse[]): string[] {
    return Array.from(new Set(counts.flatMap((count) => Object.keys(count.quant_measurements))));
  }

  /**
   * Parses the raw counts object, stripping out extra fields, and maps measurements to their definitions.
   *
   * @param {((ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[])} counts
   * @param {CBQualitativeMeasurementTypeDefinition[]} qualitativeDefinitions
   * @param {CBQuantitativeMeasurementTypeDefinition[]} quantitativeDefinitions
   * @return {*}  {ObservationAnalyticsResponse[]}
   * @memberof AnalyticsService
   */
  _processCounts(
    counts: (ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[],
    qualitativeDefinitions: CBQualitativeMeasurementTypeDefinition[],
    quantitativeDefinitions: CBQuantitativeMeasurementTypeDefinition[]
  ): ObservationAnalyticsResponse[] {
    const newCounts: ObservationAnalyticsResponse[] = [];

    for (const count of counts) {
      const { row_count, individual_count, individual_percentage, qual_measurements, quant_measurements } = count;

      newCounts.push({
        row_count,
        individual_count,
        individual_percentage,
        qualitative_measurements: this._mapQualitativeMeasurements(qual_measurements, qualitativeDefinitions),
        quantitative_measurements: this._mapQuantitativeMeasurements(quant_measurements, quantitativeDefinitions)
      });
    }

    return newCounts;
  }

  /**
   * Maps qualitative measurements to their definitions.
   *
   * @param {({ option_id: string | null; critterbase_taxon_measurement_id: string }[])} qualMeasurements
   * @param {CBQualitativeMeasurementTypeDefinition[]} definitions
   * @return {*}  {QualitativeMeasurementAnalytics[]}
   * @memberof AnalyticsService
   */
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

  /**
   * Maps quantitative measurements to their definitions.
   *
   * @param {({ value: number | null; critterbase_taxon_measurement_id: string }[])} quantMeasurements
   * @param {CBQuantitativeMeasurementTypeDefinition[]} definitions
   * @return {*}  {QuantitativeMeasurementAnalytics[]}
   * @memberof AnalyticsService
   */
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

  /**
   * Transforms the keys of the measurement objects to arrays.
   *
   * @param {ObservationCountByGroupSQLResponse[]} counts
   * @return {*}  {((ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[])}
   * @memberof AnalyticsService
   */
  _transformMeasurementObjectKeysToArrays(
    counts: ObservationCountByGroupSQLResponse[]
  ): (ObservationCountByGroupWithMeasurements & ObservationCountByGroup)[] {
    return counts.map((count) => {
      const { row_count, individual_count, individual_percentage, quant_measurements, qual_measurements } = count;

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
        row_count,
        individual_count,
        individual_percentage,
        qual_measurements: qualitative,
        quant_measurements: quantitative
      };
    });
  }
}
