import { getKnex, IDBConnection } from '../../../database/db';
import { getLogger } from '../../../utils/logger';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';

const defaultLog = getLogger('services/export-survey-metadata-strategy');

export type ExportSurveyMetadataConfig = {
  surveyId: number;
  isUserAdmin: boolean;
};

/**
 * Provides functionality for exporting survey metadata data.
 *
 * @export
 * @class ExportSurveyMetadataStrategy
 * @extends {DBService}
 * @implements {ExportStrategy}
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
      return {
        queries: [
          {
            sql: this._getSql(),
            fileName: 'survey_metadata.json'
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
   * Build and return the survey metadata data sql query.
   *
   * @memberof ExportSurveyMetadataStrategy
   */
  _getSql = () => {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder().select('*').from('survey').where('survey_id', this.config.surveyId);

    return queryBuilder;
  };
}
