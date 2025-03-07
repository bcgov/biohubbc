import { IDBConnection } from '../../../database/db';
import { ObservationRepository } from '../../../repositories/observation-repository/observation-repository';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { SubCountService } from '../../subcount-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';

const defaultLog = getLogger('services/export-observation-strategy');

export type ExportObservationConfig = {
  surveyId: number;
  isUserAdmin: boolean;
};

/**
 * Provides functionality for exporting observation data.
 *
 * @export
 * @class ExportObservationStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
 */
export class ExportObservationStrategy extends DBService implements ExportStrategy {
  config: ExportObservationConfig;

  constructor(config: ExportObservationConfig, connection: IDBConnection) {
    super(connection);

    this.config = config;
  }

  /**
   * Get the export strategy configuration for the observations.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportObservationStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      return {
        queries: [
          {
            sql: this._getSql(),
            measurementsMap: await this._getMeasurementsMap(),
            fileName: 'observations.csv',
            csvHeader: [
              'Observation ID',
              'Subcount ID',
              'Tsn',
              'Species',
              'Site',
              'Technique',
              'Period',
              'Sign',
              'Count',
              'Date',
              'Time',
              'Latitude',
              'Longitude',
              'Comment'
            ].join(','),
            transformFunction: ExportObservationStrategy.observationCsvTransformation
          }
        ]
      };
    } catch (error) {
      defaultLog.error({
        label: 'getExportStrategyConfig',
        message: 'Error generating export strategy config.',
        error
      });

      throw error;
    }
  }

  /**
   * Build and return the observation data sql query.
   *
   * @memberof ExportObservationStrategy
   */
  _getSql = () => {
    return ObservationRepository.buildObservationQuery(this.config.surveyId);
  };

  /**
   * Build and return the lookup measurements map with all pertinent uuids for the survey
   *
   * @async
   * @returns {Map<string, string>}
   * @memberof ExportObservationStrategy
   */
  _getMeasurementsMap = async () => {
    const subcountService = new SubCountService(this.connection);
    // Fetch all measurement type definitions from Critterbase for the unique taxon_measurement_ids
    const response = await subcountService.getMeasurementTypeDefinitionsForSurvey(this.config.surveyId);

    const flatDataMap = new Map<string, string>();
    // Populate the map with the options and measurements
    response.qualitative_measurements.forEach((measurement) => {
      // Add measurement name to the map
      flatDataMap.set(measurement.taxon_measurement_id, measurement.measurement_name);
      // Add options to the map
      measurement.options.forEach((option) => {
        flatDataMap.set(option.qualitative_option_id, option.option_label);
      });
    });

    // Add quantitative_measurements in the map
    response.quantitative_measurements.forEach((measurement) => {
      // Add quantitative measurement name to the map
      flatDataMap.set(measurement.taxon_measurement_id, measurement.measurement_name);
    });

    return flatDataMap;
  };

  /**
   * Transform query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @param {?Map<string, string>} [measurementsMap]
   * @returns {string}
   * @memberof ExportObservationStrategy
   */
  static readonly observationCsvTransformation = (
    item: Record<string, any>,
    measurementsMap?: Map<string, string>
  ): string => {
    const getLabelById = (id: string): string | undefined => {
      return measurementsMap ? measurementsMap.get(id) : id;
    };
    // extract environment qualitative and quantitative values
    const envValues: string[] = item.env_data.map((envItem: { ev: string }) => envItem.ev);
    // extract measurments qualitative and quantitative values
    const measValues: string[] = item.meas_data.map((measItem: { mv: string }) => getLabelById(measItem.mv));

    return [
      item.observation_id,
      item.subcount_id,
      item.tsn,
      `"${item.species ?? ''}"`,
      `"${item.site ?? ''}"`,
      `"${item.technique ?? ''}"`,
      (item.start_date ? `${item.start_date} - ` : '') + (item.end_date || ''),
      `"${item.sign ?? ''}"`,
      item.count,
      item.observation_date,
      item.observation_time,
      item.latitude,
      item.longitude,
      `"${item.comment ?? ''}"`,
      ...envValues,
      ...measValues
    ].join(',');
  };
}
