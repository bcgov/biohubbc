import { IDBConnection } from '../../../database/db';
import { ObservationRepository } from '../../../repositories/observation-repository/observation-repository';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
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
   * Transform query result record into CSV
   *
   * @static
   * @param {Record<string, any>} item
   * @returns {string}
   * @memberof ExportObservationStrategy
   */
  static readonly observationCsvTransformation = (item: Record<string, any>): string => {
    const envValues = [];
    for (let i = 0; i < item.env_data.length; i++) {
      const envItem = item.env_data[i];
      envValues.push(envItem.env_value);
    }

    return [
      item.observation_id,
      item.subcount_id,
      item.tsn,
      item.species,
      item.site,
      item.technique,
      (item.start_date ? `${item.start_date} - ` : '') + (item.end_date || ''),
      item.sign,
      item.count,
      item.observation_date,
      item.observation_time,
      item.latitude,
      item.longitude,
      item.comment,
      ...envValues
    ].join(',');
  };
}
