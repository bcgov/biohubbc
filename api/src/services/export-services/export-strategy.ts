import { Knex } from 'knex';
import { PoolClient } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { Readable } from 'stream';
import { IDBConnection } from '../../database/db';

export type ExportDataQuery = {
  /**
   * The SQL statement or Knex query builder to execute to fetch the data.
   */
  sql: SQLStatement | Knex.QueryBuilder;
  /**
   * The file name to use for the exported data when it is saved to S3.
   */
  fileName: string;
};

export type ExportDataStream = {
  /**
   * The stream that yields the exported data.
   */
  stream: (dbClient: PoolClient) => Readable;
  /**
   * The file name to use for the exported data when it is saved to S3.
   */
  fileName: string;
};

export type ExportStrategyConfig = {
  /**
   * The queries that fetch the data for this export strategy.
   */
  queries?: ExportDataQuery[];
  /**
   * The streams that yield the exported data.
   */
  streams?: ExportDataStream[];
};

export type ExportConfig = {
  /**
   * The export strategies to execute.
   */
  exportStrategies: ExportStrategy[];
  /**
   * The S3 key for the archive (zip) file to upload the exported data to.
   */
  s3Key: string;
};

/**
 * Provides functionality for exporting data.
 *
 * @export
 * @interface ExportStrategy
 */
export interface ExportStrategy {
  /**
   * Get the export strategy configuration.
   *
   * @param {IDBConnection} connection
   * @return {*}  {Promise<ExportStrategyConfig>}
   * @memberof ExportStrategy
   */
  getExportStrategyConfig(connection: IDBConnection): Promise<ExportStrategyConfig>;
}
