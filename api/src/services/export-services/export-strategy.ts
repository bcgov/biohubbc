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
   * Optional, applies only for observations export
   * map to look up observations qualitative measurments labels by Id
   *
   * @type {?Map<string, string>}
   */
  measurementsMap?: Map<string, string>;
  /**
   * The file name to use for the exported data when it is saved to S3.
   */
  fileName: string;
  /**
   * The data CSV file header.
   */
  csvHeader: string;

  /**
   * Function that transforms the query data stream into CVS
   *
   * @type {TransformFunction}
   */
  transformFunction: TransformFunction;
};

/**
 * Function that transforms the result query data into CSV
 *
 * @export
 * @typedef {TransformFunction}
 */
export type TransformFunction = (chunk: Record<string, any>) => string;

export type ExportDataStreamOptions = {
  /**
   * A SIMS database client.
   *
   * @type {PoolClient}
   */
  dbClient: PoolClient;
};

export type ExportDataStream = {
  /**
   * The stream that yields the exported data.
   */
  stream: (options: ExportDataStreamOptions) => Readable;
  /**
   * The file name to use for the exported data when it is saved to S3.
   */
  fileName: string;
  /**
   * The data base CSV file header.
   */
  csvHeader: string;
  // /**
  //  * Optional, applies only for animal export
  //  * map to look up only the critter ids with mortality that belong to a survey
  //  *
  //  * @type {?Map<string, IMortalityMarkingsData>}
  //  */
  // mortalityMarkingsMap?: Map<string, IMortalityMarkingsData>;
  /**
   * Optional, applies only for animal export
   * map to look up collection categories labels by tsn
   *
   * @type {?string[]}
   */
  collectionCategories?: string[];
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
