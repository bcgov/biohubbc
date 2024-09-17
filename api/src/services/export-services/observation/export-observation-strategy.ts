import { getKnex, IDBConnection } from '../../../database/db';
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
            fileName: 'observations.json'
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
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select('*')
      .from('survey_observation')
      .where('survey_id', this.config.surveyId);

    return queryBuilder;
  };
}
