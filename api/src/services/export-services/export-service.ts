import archiver from 'archiver';
import { Knex } from 'knex';
import QueryStream from 'pg-query-stream';
import { SQLStatement } from 'sql-template-strings';
import { PassThrough } from 'stream';
import { IDBConnection } from '../../database/db';
import { getS3SignedURLs, uploadStreamToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { DBService } from '../db-service';
import { ExportConfig } from './export-strategy';

const defaultLog = getLogger('/api/src/services/export-services/export-service.ts');

const EXPORT_ARCHIVE_MIME_TYPE = 'application/zip';

/**
 * Provides functionality for exporting data.
 *
 * @export
 * @class ExportService
 * @extends {DBService}
 */
export class ExportService extends DBService {
  constructor(connection: IDBConnection) {
    super(connection);
  }

  /**
   * Export the results of a set of SQL queries to S3.
   *
   * @param {ExportDataConfig} config
   * @return {*}  {Promise<string[]>}
   * @memberof ExportService
   */
  async export(exportConfig: ExportConfig): Promise<string[]> {
    defaultLog.debug({ label: 'export', message: 'exportConfig', exportConfig });

    if (exportConfig.exportStrategies.length === 0) {
      throw new Error('No export strategies have been defined.');
    }

    const dbClient = await this.connection.getClient();

    // Array to hold all streams, so they can be destroyed in case of an error
    const allStreams = [];

    const archiveStream = archiver('zip', {
      zlib: {
        level: 9 // Compression level
      }
    });

    const archiveStreamPassthrough = new PassThrough();

    // Add all streams to the array to destroy in case of an error
    allStreams.push(archiveStream, archiveStreamPassthrough);

    try {
      archiveStream.pipe(archiveStreamPassthrough);

      // Start the S3 upload
      const uploadPromise = uploadStreamToS3(archiveStreamPassthrough, EXPORT_ARCHIVE_MIME_TYPE, exportConfig.s3Key);

      await Promise.all(
        exportConfig.exportStrategies.map(async (exportStrategy) => {
          const exportStrategyConfig = await exportStrategy.getExportStrategyConfig(this.connection);

          defaultLog.silly({ label: 'export', message: 'exportStrategyConfig', exportStrategyConfig });

          for (const queryConfig of exportStrategyConfig.queries) {
            const { text, values } = this._getQueryParams(queryConfig.sql);

            // Create a query stream for the sql query
            const queryStream = new QueryStream(text, values);

            // Create a pass through stream to ensure the query stream is stringified
            const queryStreamPassThrough = new PassThrough({
              objectMode: true,
              transform(chunk, _encoding, callback) {
                // Ensure chunk is a stringified JSON
                callback(null, JSON.stringify(chunk));
              }
            });

            // Add all streams to the array to destroy in case of an error
            allStreams.push(queryStream, queryStreamPassThrough);

            // Append the file stream to the archive stream
            archiveStream.append(queryStream.pipe(queryStreamPassThrough), { name: queryConfig.fileName });

            // Execute the query and pipe the results to the file stream
            dbClient.query(queryStream);
          }
        })
      );

      archiveStream.finalize();

      // Wait for the upload to complete
      await uploadPromise;

      // Generate signed URLs for the export files
      return this._getAllSignedURLs([exportConfig.s3Key]);
    } catch (error) {
      console.error('Error exporting data to s3.', error);

      // Destroy all streams
      allStreams.forEach((stream) => stream.destroy());

      throw error;
    } finally {
      // Release the client back to the pool
      dbClient.release();
    }
  }

  /**
   * Generate a signed URL for each s3Key.
   *
   * @param {string[]} s3Keys
   * @return {*}  {Promise<string[]>}
   * @memberof ExportService
   */
  async _getAllSignedURLs(s3Keys: string[]): Promise<string[]> {
    defaultLog.debug({ label: '_getAllSignedURLs', message: 'Generating signed URLs for export file(s).' });

    const signedURLs = await getS3SignedURLs(s3Keys);

    if (signedURLs.some((item) => item === null)) {
      throw new Error('Failed to generate signed URLs for all export files.');
    }

    return signedURLs as string[];
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
}
