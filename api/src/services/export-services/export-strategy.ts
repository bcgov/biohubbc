import { Knex } from 'knex';
import { SQLStatement } from 'sql-template-strings';
import { IDBConnection } from '../../database/db';

export type ExportDataQuery = {
  /**
   * The SQL statement or Knex query builder to execute to fetch the data.
   *
   * @type {(SQLStatement | Knex.QueryBuilder)}
   */
  sql: SQLStatement | Knex.QueryBuilder;
  /**
   * The file name to use for the exported data when it is saved to S3.
   *
   * @type {string}
   */
  fileName: string;
};

export type ExportStrategyConfig = {
  /**
   * The queries that fetch the data for this export strategy.
   *
   * @type {ExportDataQuery[]}
   */
  queries: ExportDataQuery[];
};

export type ExportConfig = {
  /**
   * The export strategies to execute and export the results to S3.
   *
   * @type {ExportStrategy[]}
   */
  exportStrategies: ExportStrategy[];
  /**
   * The S3 key for the archive (zip) file to upload the exported data to.
   *
   * @type {string}
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
