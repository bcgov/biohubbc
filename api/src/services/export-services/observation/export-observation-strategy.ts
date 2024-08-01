import { getKnex, IDBConnection } from '../../../database/db';
import { DBService } from '../../db-service';
import { ExportStrategy, ExportStrategyConfig } from '../export-strategy';

export type ExportObservationConfig = {
  surveyId: number;
};

/**
 * Provides functionality for exporting observation data.
 *
 * @export
 * @class ExportObservationStrategy
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
      const knex = getKnex();

      const queryBuilder = knex
        .queryBuilder()
        .select('*')
        .from('survey_observation')
        .where('survey_id', this.config.surveyId);

      return {
        queries: [
          {
            sql: queryBuilder,
            fileName: 'observations.json'
          }
        ]
      };
    } catch (error) {
      console.error('Error generating observation export strategy config.', error);
      throw error;
    }
  }
}
