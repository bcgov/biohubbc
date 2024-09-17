import { IDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';
import { ExportObservationStrategy } from '../observation/export-observation-strategy';
import { ExportTelemetryStrategy } from '../telemetry/export-telemetry-strategy';
import { ExportSurveyMetadataStrategy } from './export-survey-metadata-strategy';

const defaultLog = getLogger('services/export-survey-strategy');

export type ExportSurveyStrategyConfig = {
  /**
   * The survey id.
   *
   * @type {number}
   */
  surveyId: number;
  /**
   * The export configuration.
   *
   * @type {ExportSurveyConfig}
   */
  config: ExportSurveyConfig;
  /**
   * The database connection.
   *
   * @type {IDBConnection}
   */
  connection: IDBConnection;
  /**
   * Indicates if the user is an admin.
   */
  isUserAdmin: boolean;
};

/**
 * Configure which data to include in the export.
 */
export type ExportSurveyConfig = {
  metadata: boolean;
  sampling_data: boolean;
  observation_data: boolean;
  telemetry_data: boolean;
  animal_data: boolean;
  artifacts: boolean;
};

/**
 * Provides functionality for exporting survey data.
 *
 * @export
 * @class ExportSurveyStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
 */
export class ExportSurveyStrategy extends DBService implements ExportStrategy {
  surveyId: number;
  config: ExportSurveyConfig;
  isUserAdmin: boolean;

  constructor(options: ExportSurveyStrategyConfig) {
    super(options.connection);

    this.surveyId = options.surveyId;
    this.config = options.config;
    this.isUserAdmin = options.isUserAdmin;
  }

  /**
   * Get the export strategy configuration for the survey.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportSurveyStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      const strategyPromises = [];

      if (this.config.metadata) {
        const strategy = new ExportSurveyMetadataStrategy(
          { surveyId: this.surveyId, isUserAdmin: this.isUserAdmin },
          this.connection
        );
        strategyPromises.push(strategy.getExportStrategyConfig());
      }

      if (this.config.observation_data) {
        const strategy = new ExportObservationStrategy(
          { surveyId: this.surveyId, isUserAdmin: this.isUserAdmin },
          this.connection
        );
        strategyPromises.push(strategy.getExportStrategyConfig());
      }

      if (this.config.telemetry_data) {
        const strategy = new ExportTelemetryStrategy(
          { surveyId: this.surveyId, isUserAdmin: this.isUserAdmin },
          this.connection
        );
        strategyPromises.push(strategy.getExportStrategyConfig());
      }

      const strategies = await Promise.all(strategyPromises);

      const allQueries = [];
      const allStreams = [];

      for (const strategy of strategies) {
        if (strategy.queries) {
          allQueries.push(...strategy.queries);
        }

        if (strategy.streams) {
          allStreams.push(...strategy.streams);
        }
      }

      return {
        queries: allQueries,
        streams: allStreams
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
}
