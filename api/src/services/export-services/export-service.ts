import { PassThrough } from 'stream';
import { IDBConnection } from '../../database/db';
import { getS3SignedURLs, uploadStreamToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { DBService } from '../db-service';
import { ExportConfig } from './export-strategy';
import {
  getArchiveStream,
  getJsonStringifyTransformStream,
  getQueryStream,
  registerStreamErrorHandler
} from './export-utils';

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
      throw new Error('No export strategies have been.');
    }

    const dbClient = await this.connection.getClient();

    try {
      const archiveStream = getArchiveStream();

      registerStreamErrorHandler(archiveStream);

      const s3UploadStream = new PassThrough();

      registerStreamErrorHandler(s3UploadStream);

      // Pipe the archive stream to the s3 upload stream
      archiveStream.pipe(s3UploadStream);

      // Start the S3 upload
      const uploadPromise = uploadStreamToS3(s3UploadStream, EXPORT_ARCHIVE_MIME_TYPE, exportConfig.s3Key);

      await Promise.all(
        exportConfig.exportStrategies.map(async (exportStrategy) => {
          const exportStrategyConfig = await exportStrategy.getExportStrategyConfig(this.connection);

          // Append and execute all export strategy queries
          if (exportStrategyConfig.queries) {
            for (const queryConfig of exportStrategyConfig.queries) {
              const queryStream = getQueryStream(queryConfig.sql);

              registerStreamErrorHandler(queryStream);

              const jsonStringifyTransformStream = getJsonStringifyTransformStream();

              registerStreamErrorHandler(jsonStringifyTransformStream);

              queryStream.pipe(jsonStringifyTransformStream);

              // Append the file stream to the archive stream
              archiveStream.append(jsonStringifyTransformStream, {
                name: queryConfig.fileName
              });

              // Execute the query and pipe the results to the file stream
              dbClient.query(queryStream);
            }
          }

          // Append all export strategy streams
          if (exportStrategyConfig.streams) {
            for (const streamConfig of exportStrategyConfig.streams) {
              // Create the stream
              const stream = streamConfig.stream({ dbClient });

              registerStreamErrorHandler(stream);

              const jsonStringifyTransformStream = getJsonStringifyTransformStream();

              registerStreamErrorHandler(jsonStringifyTransformStream);

              stream.pipe(jsonStringifyTransformStream);

              // Append the stream output to the archive stream
              archiveStream.append(jsonStringifyTransformStream, { name: streamConfig.fileName });
            }
          }
        })
      );

      // Finalize the archive stream (finished appending streams)
      await archiveStream.finalize();

      // Wait for the S3 upload to complete
      await uploadPromise;

      // Generate signed URLs for the export file
      return this._getAllSignedURLs([exportConfig.s3Key]);
    } catch (error) {
      defaultLog.error({ label: 'export', message: 'Error exporting data.', error });
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
}
