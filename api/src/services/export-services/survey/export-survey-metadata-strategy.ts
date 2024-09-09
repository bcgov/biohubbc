import { PoolClient } from 'pg';
import QueryStream from 'pg-query-stream';
import { PassThrough, Readable } from 'stream';
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
      return {
        streams: [
          {
            stream: this._getSurveyMetadataStream,
            fileName: 'survey_metadata.json'
          }
        ]
      };
    } catch (error) {
      console.error('Error generating survey metadata export strategy config.', error);
      throw error;
    }
  }

  /**
   * Build and return the survey metadata data stream.
   *
   * @param {PoolClient} dbClient
   * @memberof ExportSurveyMetadataStrategy
   */
  _getSurveyMetadataStream = (dbClient: PoolClient): Readable => {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder().select('*').from('survey').where('survey_id', this.config.surveyId);

    const { sql, bindings } = queryBuilder.toSQL().toNative();

    const queryStream = new QueryStream(sql, bindings as any[]);

    // Create a pass through stream to ensure the query stream is stringified
    const queryStreamPassThrough = new PassThrough({
      objectMode: true,
      transform(chunk, _encoding, callback) {
        // Ensure chunk is a stringified JSON
        callback(null, JSON.stringify(chunk));
      }
    });

    dbClient.query(queryStream);

    return queryStream.pipe(queryStreamPassThrough);
  };
}
