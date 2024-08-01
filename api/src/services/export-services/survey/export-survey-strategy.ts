import { IDBConnection } from '../../../database/db';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';
import { ExportObservationStrategy } from '../observation/export-observation-strategy';
import { ExportSurveyMetadataStrategy } from './export-survey-metadata-strategy';

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
 */
export class ExportSurveyStrategy extends DBService implements ExportStrategy {
  surveyId: number;
  config: ExportSurveyConfig;

  constructor(surveyId: number, config: ExportSurveyConfig, connection: IDBConnection) {
    super(connection);

    this.surveyId = surveyId;
    this.config = config;
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
        const exportSurveyMetadataStrategy = new ExportSurveyMetadataStrategy(
          { surveyId: this.surveyId },
          this.connection
        );

        strategyPromises.push(exportSurveyMetadataStrategy.getExportStrategyConfig());
      }

      if (this.config.observation_data) {
        const exportObservationStrategy = new ExportObservationStrategy({ surveyId: this.surveyId }, this.connection);

        strategyPromises.push(exportObservationStrategy.getExportStrategyConfig());
      }

      const strategies = await Promise.all(strategyPromises);

      return {
        queries: strategies.flatMap((strategy) => strategy.queries).flat()
      };
    } catch (error) {
      console.error('Error generating survey export strategy config.', error);
      throw error;
    }
  }
}
