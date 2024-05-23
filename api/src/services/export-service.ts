import { ManagedUpload } from 'aws-sdk/clients/s3';
import { Knex } from 'knex';
import QueryStream from 'pg-query-stream';
import { SQLStatement } from 'sql-template-strings';
import { PassThrough, Transform } from 'stream';
import { IDBConnection } from '../database/db';
import { uploadStreamToS3 } from '../utils/file-utils';
// import { getLogger } from '../utils/logger';
import archiver from 'archiver';
import { DBService } from './db-service';

// const defaultLog = getLogger('api/src/services/export-service.ts');

export type ExportSQLResultsToS3QueryConfig = {
  sql: SQLStatement | Knex.QueryBuilder;
  fileName: string;
};

export type ExportSQLResultsToS3Config = {
  /**
   * The database connection to use for the export.
   *
   * @type {IDBConnection}
   */
  connection: IDBConnection;
  /**
   * The queries to execute and export the results to S3.
   *
   * @type {ExportSQLResultsToS3QueryConfig[]}
   */
  queries: ExportSQLResultsToS3QueryConfig[];
  /**
   * The S3 key for the archive (zip) file to upload the exported data to.
   *
   * @type {string}
   */
  s3Key: string;
};

/**
 * Provides functionality for exporting survey data.
 *
 * @export
 * @class ExportService
 * @extends {DBService}
 */
export class ExportService extends DBService {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  async exportSQLResultsToS3(config: ExportSQLResultsToS3Config): Promise<ManagedUpload.SendData> {
    const dbClient = await config.connection.getClient();

    // Array to hold all streams to destroy in case of an error
    const allStreams = [];

    const archiveStream = this._getArchiveStream();

    const archiveStreamPasthrough = new PassThrough();

    allStreams.push(archiveStream, archiveStreamPasthrough);

    try {
      archiveStream.pipe(archiveStreamPasthrough);

      for (const queryConfig of config.queries) {
        const { text, values } = this._getQueryParams(queryConfig.sql);

        // Create a query stream for the sql query
        const queryStream = new QueryStream(text, values);

        const queryStreamPassThrough = new PassThrough();

        const jsonStringifyTransformStream = this._getJsonStringifyTransformStream();

        // Pipe the query stream passthrough to the transform stream
        const fileStream = queryStreamPassThrough.pipe(jsonStringifyTransformStream);

        // Add all streams to the array to destroy in case of an error
        allStreams.push(queryStream, queryStreamPassThrough, jsonStringifyTransformStream, fileStream);

        // Append the file stream to the archive stream
        archiveStream.append(fileStream, { name: queryConfig.fileName });

        // Execute the query and pipe the results to the file stream
        dbClient.query(queryStream).pipe(queryStreamPassThrough);
      }

      archiveStream.finalize();

      return uploadStreamToS3(archiveStreamPasthrough, 'application/zip', config.s3Key);
    } catch (error) {
      console.error('Error exporting db to s3.', error);

      // Destroy all streams
      allStreams.forEach((stream) => stream.destroy());

      throw error;
    } finally {
      // Release the client back to the pool
      dbClient.release();
    }
  }

  /**
   * Get the query text and values from a SQLStatement or Knex.QueryBuilder.
   *
   * @param {(SQLStatement | Knex.QueryBuilder)} query
   * @return {*}  {{ text: string; values: unknown[] }}
   * @memberof ExportService
   */
  _getQueryParams(query: SQLStatement | Knex.QueryBuilder): { text: string; values: unknown[] } {
    let queryText = '';
    let queryValues = [];

    if (query instanceof SQLStatement) {
      queryText = query.text;
      queryValues = query.values;
    } else {
      queryText = query.toSQL().toNative().sql;
      queryValues = query.toSQL().toNative().bindings as unknown[];
    }

    return { text: queryText, values: queryValues };
  }

  /**
   * Get an archive stream for exporting data.
   *
   * @return {*}  {archiver.Archiver}
   * @memberof ExportService
   */
  _getArchiveStream(): archiver.Archiver {
    return archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
  }

  /**
   * Get a JSON stringify transform stream for exporting data.
   *
   * @return {*}  {Transform}
   * @memberof ExportService
   */
  _getJsonStringifyTransformStream(): Transform {
    return new Transform({
      objectMode: true,
      transform(chunk, _encoding, callback) {
        const data = JSON.stringify(chunk);
        this.push(data);
        callback();
      }
    });
  }
}
