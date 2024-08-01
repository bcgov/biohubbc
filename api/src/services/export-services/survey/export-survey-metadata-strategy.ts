import { getKnex, IDBConnection } from '../../../database/db';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';

export type ExportSurveyMetadataConfig = {
  surveyId: number;
};

/**
 * Provides functionality for exporting survey metadata data.
 *
 * @export
 * @class ExportSurveyStrategy
 * @extends {DBService}
 */
export class ExportSurveyMetadataStrategy extends DBService implements ExportStrategy {
  config: ExportSurveyMetadataConfig;

  constructor(config: ExportSurveyMetadataConfig, connection: IDBConnection) {
    super(connection);

    this.config = config;
  }

  /**
   * Get the export strategy configuration for the survey metadata.
   *
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportSurveyMetadataStrategy
   */
  async getExportStrategyConfig(): Promise<ExportStrategyConfig> {
    try {
      const knex = getKnex();

      const queryBuilder = knex.queryBuilder().select('*').from('survey').where('survey_id', this.config.surveyId);

      return {
        queries: [
          {
            sql: queryBuilder,
            fileName: 'survey_metadata.json'
          }
        ]
      };
    } catch (error) {
      console.error('Error generating survey metadata export strategy config.', error);
      throw error;
    }
  }
}
